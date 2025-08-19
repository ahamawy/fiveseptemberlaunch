/**
 * Deal Equation Executor
 * Executes deal-specific fee equations using the enhanced calculator
 * Each deal has its own unique calculation rules and relationships
 */

import {
  EnhancedFeeCalculator,
  FeeCalculationResult,
  DiscountInput,
} from "./enhanced-calculator";
import { SupabaseDirectClient } from "@/lib/db/supabase/client";
import { SchemaConfig } from "@/lib/db/schema-manager/config";

// Deal equation configuration types
export interface DealEquationRule {
  basis: "GROSS" | "NET" | "NET_AFTER_PREMIUM";
  rate?: number;
  formula?: string;
  precedence: number;
  annual?: boolean;
  fixed_amount?: number;
  discount_conditions?: {
    min_capital?: number;
    max_capital?: number;
    discount_percent?: number;
    discount_amount?: number;
  };
}

export interface PerformanceRule {
  basis: "PROFIT" | "PROFIT_AFTER_RETURN" | "NET";
  hurdle_rate?: number;
  carry_rate?: number;
  formula?: string;
  precedence: number;
}

export interface DealEquation {
  deal_id: number;
  equation_name: string;
  rules: {
    premium?: DealEquationRule;
    structuring?: DealEquationRule;
    management?: DealEquationRule;
    performance?: PerformanceRule;
    admin?: DealEquationRule;
  };
  metadata: {
    schedule_version?: number;
    party_type: "investor" | "partner";
    effective_date: Date;
  };
}

export interface TransactionContext {
  gross_capital: number;
  units: number;
  unit_price: number;
  years?: number;
  deal_id: number;
  investor_id: number;
  transaction_date?: Date;
  profit?: number;
  returned_capital?: number;
  current_valuation?: number;
}

export interface ExecutionResult extends FeeCalculationResult {
  equation_name: string;
  applied_discounts: DiscountInput[];
}

export class DealEquationExecutor {
  private calculator: EnhancedFeeCalculator;
  private client: SupabaseDirectClient;

  constructor() {
    this.calculator = new EnhancedFeeCalculator();
    this.client = new SupabaseDirectClient(new SchemaConfig());
  }

  /**
   * Load deal's equation configuration
   */
  async loadDealEquation(dealId: number): Promise<DealEquation | null> {
    const supabase = this.client.getClient();

    // Load from fee schedule metadata
    const { data: schedule } = await supabase
      .from("fee_schedule_config")
      .select("*")
      .eq("deal_id", dealId)
      .order("precedence", { ascending: true });

    if (!schedule || schedule.length === 0) {
      // Return default equation if none exists
      return this.getDefaultEquation(dealId);
    }

    // Build equation from schedule
    const equation: DealEquation = {
      deal_id: dealId,
      equation_name: "CUSTOM_FROM_SCHEDULE",
      rules: {},
      metadata: {
        party_type: "investor",
        effective_date: new Date(),
      },
    };

    // Map schedule components to equation rules
    for (const component of schedule) {
      const rule: DealEquationRule = {
        basis: component.basis as "GROSS" | "NET" | "NET_AFTER_PREMIUM",
        rate: component.is_percent ? parseFloat(component.rate) : undefined,
        fixed_amount: !component.is_percent
          ? parseFloat(component.rate)
          : undefined,
        precedence: component.precedence,
      };

      // No notes field in fee_schedule_config, so we can't store metadata there

      // Assign to appropriate component
      const componentName = component.component.toLowerCase();
      if (componentName === "premium") equation.rules.premium = rule;
      else if (componentName === "structuring")
        equation.rules.structuring = rule;
      else if (componentName === "management") equation.rules.management = rule;
      else if (componentName === "admin") equation.rules.admin = rule;
      else if (componentName === "performance") {
        equation.rules.performance = {
          basis: "PROFIT",
          carry_rate: rule.rate,
          precedence: rule.precedence,
        };
      }
    }

    return equation;
  }

  /**
   * Get default equation for deal type
   */
  private async getDefaultEquation(dealId: number): Promise<DealEquation> {
    // Standard primary deal equation
    return {
      deal_id: dealId,
      equation_name: "STANDARD_PRIMARY_V1",
      rules: {
        premium: {
          basis: "GROSS",
          rate: 0.03,
          precedence: 1,
        },
        structuring: {
          basis: "NET",
          rate: 0.02,
          precedence: 2,
          discount_conditions: {
            min_capital: 5000000,
            discount_percent: 0.5,
          },
        },
        management: {
          basis: "NET_AFTER_PREMIUM",
          rate: 0.015,
          annual: true,
          precedence: 3,
        },
        admin: {
          fixed_amount: 500,
          precedence: 4,
          basis: "GROSS",
        },
      },
      metadata: {
        party_type: "investor",
        effective_date: new Date(),
      },
    };
  }

  /**
   * Execute deal equation
   */
  async execute(
    dealId: number,
    context: TransactionContext,
    overrideEquation?: DealEquation
  ): Promise<ExecutionResult> {
    // Load deal's equation, allow one-off override per transaction
    const equation = overrideEquation ?? (await this.loadDealEquation(dealId));
    if (!equation) {
      throw new Error(`No equation found for deal ${dealId}`);
    }

    // Use enhanced calculator with equation rules
    const schedule = await this.calculator.loadActiveFeeSchedule(dealId);

    // Calculate base fees
    let result = await this.calculator.calculate(
      dealId,
      context.gross_capital,
      context.unit_price,
      {
        validateOnly: false,
      }
    );

    // Apply equation-specific modifications
    const discounts: DiscountInput[] = [];

    // Apply annual multipliers
    if (equation.rules.management?.annual && context.years) {
      result = await this.calculator.calculate(
        dealId,
        context.gross_capital,
        context.unit_price,
        {
          annualFees: [{ component: "MANAGEMENT", years: context.years }],
        }
      );
    }

    // Evaluate discount conditions
    if (equation.rules.structuring?.discount_conditions) {
      const conditions = equation.rules.structuring.discount_conditions;
      if (
        conditions.min_capital &&
        context.gross_capital >= conditions.min_capital
      ) {
        discounts.push({
          component: "STRUCTURING_DISCOUNT",
          percent: conditions.discount_percent,
          amount: conditions.discount_amount,
        });
      }
    }

    // Apply discounts if any
    if (discounts.length > 0) {
      result = await this.calculator.calculate(
        dealId,
        context.gross_capital,
        context.unit_price,
        {
          discounts,
          annualFees:
            equation.rules.management?.annual && context.years
              ? [{ component: "MANAGEMENT", years: context.years }]
              : undefined,
        }
      );
    }

    // Handle performance/carry calculations
    if (equation.rules.performance && context.profit !== undefined) {
      const perf = equation.rules.performance;
      let performanceFee = 0;

      if (perf.formula) {
        // Custom formula evaluation would go here
        // For now, use standard carry calculation
        const profitAfterReturn =
          (context.profit || 0) - (context.returned_capital || 0);
        const hurdle = context.gross_capital * (perf.hurdle_rate || 0);

        if (profitAfterReturn > hurdle) {
          performanceFee =
            (profitAfterReturn - hurdle) * (perf.carry_rate || 0.2);
        }
      } else if (perf.carry_rate) {
        // Simple carry calculation
        performanceFee = (context.profit || 0) * perf.carry_rate;
      }

      // Add performance fee to result
      if (performanceFee > 0) {
        result.state.appliedFees.push({
          deal_id: dealId,
          component: "PERFORMANCE",
          amount: performanceFee,
          percent: perf.carry_rate || null,
          basis: perf.basis,
          applied: true,
          notes: `Performance fee calculated: ${performanceFee}`,
        });
      }
    }

    return {
      ...result,
      equation_name: equation.equation_name,
      applied_discounts: discounts,
    };
  }

  /**
   * Preview equation calculation without persisting
   */
  async preview(
    dealId: number,
    context: TransactionContext,
    overrideEquation?: DealEquation
  ): Promise<ExecutionResult> {
    return this.execute(dealId, context, overrideEquation);
  }

  /**
   * Store equation configuration for a deal
   */
  async saveEquation(equation: DealEquation): Promise<void> {
    try {
      const supabase = this.client.getClient();
      console.log("Supabase client initialized:", !!supabase);

      // Store as fee schedule with metadata in notes
      const scheduleRows = [];

      for (const [component, rule] of Object.entries(equation.rules)) {
        if (!rule) continue;

        const componentRule = rule as DealEquationRule;
        scheduleRows.push({
          deal_id: equation.deal_id,
          component: component.toUpperCase(),
          basis: componentRule.basis,
          precedence: componentRule.precedence,
          is_percent: !!componentRule.rate,
          rate: componentRule.rate || componentRule.fixed_amount || 0,
          created_at: new Date().toISOString(),
        });
      }

      // Insert schedule rows
      if (scheduleRows.length > 0) {
        console.log("Inserting schedule rows:", scheduleRows.length);
        console.log(
          "First row sample:",
          JSON.stringify(scheduleRows[0], null, 2)
        );
        const { data, error } = await supabase
          .from("fee_schedule_config")
          .insert(scheduleRows)
          .select();

        if (error) {
          console.error("Supabase error:", error);
          throw new Error(
            `Failed to save equation: ${
              error?.message || JSON.stringify(error)
            }`
          );
        }
        console.log("Successfully saved equation for deal:", equation.deal_id);
      }
    } catch (error) {
      console.error("Error in saveEquation:", error);
      throw error;
    }
  }

  /**
   * Get equation templates
   */
  static getEquationTemplates(): Record<string, Partial<DealEquation>> {
    return {
      STANDARD_PRIMARY_V1: {
        equation_name: "STANDARD_PRIMARY_V1",
        rules: {
          premium: { basis: "GROSS", rate: 0.03, precedence: 1 },
          structuring: {
            basis: "NET",
            rate: 0.02,
            precedence: 2,
            discount_conditions: {
              min_capital: 5000000,
              discount_percent: 0.5,
            },
          },
          management: {
            basis: "NET_AFTER_PREMIUM",
            rate: 0.015,
            annual: true,
            precedence: 3,
          },
          admin: { fixed_amount: 500, precedence: 4, basis: "GROSS" },
        },
      },
      CARRY_FUND_V1: {
        equation_name: "CARRY_FUND_V1",
        rules: {
          management: {
            basis: "GROSS",
            rate: 0.02,
            annual: true,
            precedence: 1,
          },
          performance: {
            basis: "PROFIT_AFTER_RETURN",
            hurdle_rate: 0.08,
            carry_rate: 0.2,
            precedence: 2,
          },
        },
      },
      SECONDARY_MARKET_V1: {
        equation_name: "SECONDARY_MARKET_V1",
        rules: {
          structuring: { basis: "GROSS", rate: 0.025, precedence: 1 },
          admin: { fixed_amount: 750, precedence: 2, basis: "GROSS" },
        },
      },
      ADVISORY_V1: {
        equation_name: "ADVISORY_V1",
        rules: {
          management: {
            basis: "GROSS",
            rate: 0.01,
            annual: true,
            precedence: 1,
          },
          performance: { basis: "PROFIT", carry_rate: 0.15, precedence: 2 },
        },
      },
    };
  }
}

// Export singleton instance
export const dealEquationExecutor = new DealEquationExecutor();
