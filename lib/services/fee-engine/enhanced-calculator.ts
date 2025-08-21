// Enhanced Fee Calculator - Schema-Accurate Implementation
// Implements precedence ordering, basis calculations, and discounts as negative rows

import { SupabaseDirectClient } from "@/lib/db/supabase/client";
import { SchemaConfig } from "@/lib/db/schema-manager/config";

// Types aligned with exact schema
export interface FeeScheduleRow {
  schedule_id: number;
  deal_id: number;
  component: string;
  rate: number;
  is_percent: boolean;
  basis: "GROSS" | "NET" | "NET_AFTER_PREMIUM";
  precedence: number;
  effective_at: Date;
  version?: number;
}

export interface FeeApplication {
  transaction_id?: number;
  deal_id: number;
  component: string;
  amount: number; // Positive for fees, NEGATIVE for discounts
  percent: number | null;
  basis?: string;
  applied: boolean;
  notes: string;
}

export interface FeeCalculationState {
  grossAmount: number;
  netAmount: number;
  premiumAmount: number;
  runningAmount: number;
  appliedFees: FeeApplication[];
}

export interface DiscountInput {
  component: string; // e.g., 'STRUCTURING_DISCOUNT'
  percent?: number;
  amount?: number;
  basis?: string;
}

export interface FeeCalculationResult {
  state: FeeCalculationState;
  transferPreDiscount: number;
  totalDiscounts: number;
  transferPostDiscount: number;
  units: number;
  validation: ValidationResult;
  metadata: {
    scheduleVersion?: number;
    precedenceOrder: string;
    calculationDate: Date;
    auditId: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class EnhancedFeeCalculator {
  private client: SupabaseDirectClient;

  constructor() {
    this.client = new SupabaseDirectClient(new SchemaConfig());
  }

  /**
   * Load active fee schedule ordered by precedence
   */
  async loadActiveFeeSchedule(dealId: number): Promise<FeeScheduleRow[]> {
    const supabase = this.client.getClient();

    // Try to load from fee_schedule_config first (public schema)
    const { data: configRows, error: configErr } = await supabase
      .from("fee_schedule_config")
      .select("*")
      .eq("deal_id", dealId)
      .order("precedence", { ascending: true });

    if (configErr) {
      throw new Error(`Failed to load fee schedule: ${configErr.message}`);
    }

    const precedenceOrder: Record<string, number> = {
      PREMIUM: 1,
      STRUCTURING: 2,
      MANAGEMENT: 3,
      ADMIN: 4,
      PERFORMANCE: 5,
      ADVISORY: 6,
    };

    if (Array.isArray(configRows) && configRows.length > 0) {
      const rows = (configRows || []).map((row: any) => {
        const basisRaw = String(row.basis || "GROSS").toUpperCase();
        const basis =
          basisRaw === "GROSS" || basisRaw === "NET" ? basisRaw : "GROSS";
        const isPercent = row.is_percent !== false;
        const rateNum = parseFloat(row.rate || "0");
        const component = String(row.component || "").toUpperCase();
        const precedence = row.precedence || precedenceOrder[component] || 99;
        return {
          schedule_id: row.schedule_id || 0,
          deal_id: Number(row.deal_id),
          component,
          rate: rateNum,
          is_percent: Boolean(isPercent),
          basis: basis as "GROSS" | "NET" | "NET_AFTER_PREMIUM",
          precedence,
          effective_at: new Date(row.created_at || Date.now()),
          version: 1,
        } as FeeScheduleRow;
      });

      // Sort by precedence and return
      rows.sort((a, b) => a.precedence - b.precedence);
      return rows;
    }

    // Fallback to public.fee_schedule_config when fees.fee_schedule is not available
    const { data, error } = await supabase
      .from("fee_schedule_config")
      .select("*")
      .eq("deal_id", dealId)
      .order("precedence", { ascending: true }); // CRITICAL: Order by precedence

    if (!error && Array.isArray(data) && data.length > 0) {
      // Transform and validate using public.fee_schedule_config
      return data.map((row) => ({
        schedule_id: row.schedule_id,
        deal_id: row.deal_id,
        component: row.component,
        rate: parseFloat(row.rate || "0"),
        is_percent: row.is_percent,
        basis: ((): "GROSS" | "NET" | "NET_AFTER_PREMIUM" => {
          const raw = String(row.basis || "").toUpperCase();
          if (raw === "GROSS_CAPITAL" || raw === "GROSS" || raw === "FIXED")
            return "GROSS";
          if (raw === "NET_AFTER_PREMIUM") return "NET_AFTER_PREMIUM";
          if (raw === "VALUATION" || raw === "NET") return "NET";
          return "NET";
        })(),
        precedence: row.precedence,
        effective_at: row.created_at ? new Date(row.created_at) : new Date(),
        version: 1,
      }));
    }

    return [];
  }

  /**
   * Calculate fees with strict precedence ordering
   */
  calculateFeesWithPrecedence(
    schedule: FeeScheduleRow[],
    grossCapital: number
  ): FeeCalculationState {
    const state: FeeCalculationState = {
      grossAmount: grossCapital,
      netAmount: grossCapital,
      premiumAmount: 0,
      runningAmount: grossCapital,
      appliedFees: [],
    };

    // Process each fee in precedence order (already sorted from DB)
    for (const fee of schedule) {
      const baseAmount = this.getBaseAmount(fee.basis, state);

      let feeAmount: number;
      if (fee.is_percent) {
        // Calculate percentage and round to 2 decimal places
        feeAmount = Math.round(baseAmount * fee.rate * 100) / 100;
      } else {
        // Flat amount
        feeAmount = fee.rate;
      }

      // Special handling for PREMIUM - affects NET calculation
      if (fee.component === "PREMIUM") {
        state.premiumAmount = feeAmount;
        state.netAmount = state.grossAmount - state.premiumAmount;
      }

      // Store as positive amount (fees are positive)
      state.appliedFees.push({
        deal_id: fee.deal_id,
        component: fee.component,
        amount: feeAmount,
        percent: fee.is_percent ? fee.rate : null,
        basis: fee.basis,
        applied: true,
        notes: `Applied at precedence ${fee.precedence}, basis: ${fee.basis}, rate: ${fee.rate}`,
      });

      // Update running amount for next calculation
      state.runningAmount = state.runningAmount - feeAmount;
    }

    return state;
  }

  /**
   * Get base amount based on basis type
   */
  private getBaseAmount(basis: string, state: FeeCalculationState): number {
    switch (basis) {
      case "GROSS":
        return state.grossAmount;
      case "NET":
        return state.netAmount;
      case "NET_AFTER_PREMIUM":
        // NET minus premium amount
        return state.netAmount - state.premiumAmount;
      default:
        // Fallback to running amount
        return state.runningAmount;
    }
  }

  /**
   * Apply discounts as negative fee_application rows
   */
  applyDiscounts(
    state: FeeCalculationState,
    discounts: DiscountInput[]
  ): FeeCalculationState {
    for (const discount of discounts) {
      // Extract base component name (remove _DISCOUNT suffix)
      const baseComponent = discount.component.replace("_DISCOUNT", "");
      const baseFee = state.appliedFees.find(
        (f) => f.component === baseComponent
      );

      if (!baseFee) {
        console.warn(`Base fee not found for discount: ${discount.component}`);
        continue;
      }

      let discountAmount: number;
      if (discount.percent !== undefined) {
        // Percentage discount on base fee
        discountAmount =
          Math.round(baseFee.amount * discount.percent * 100) / 100;
      } else if (discount.amount !== undefined) {
        // Fixed amount discount (capped at base fee)
        discountAmount = Math.min(discount.amount, baseFee.amount);
      } else {
        continue;
      }

      // CRITICAL: Store as NEGATIVE amount
      state.appliedFees.push({
        deal_id: baseFee.deal_id,
        component: discount.component,
        amount: -Math.abs(discountAmount), // Always negative
        percent: discount.percent || null,
        basis: discount.basis || baseFee.basis,
        applied: true,
        notes: `Discount on ${baseComponent}: ${
          discount.percent
            ? discount.percent * 100 + "%"
            : "$" + discount.amount
        }`,
      });

      // Add back to running amount (discount reduces fees)
      state.runningAmount += discountAmount;
    }

    return state;
  }

  /**
   * Apply annual fees (stored with notes for audit)
   */
  applyAnnualFees(
    state: FeeCalculationState,
    annualFees: Array<{ component: string; years: number }>
  ): FeeCalculationState {
    for (const annual of annualFees) {
      const fee = state.appliedFees.find(
        (f) => f.component === annual.component
      );
      if (!fee) continue;

      // Update the fee amount for multiple years
      const originalAmount = fee.amount;
      fee.amount = Math.round(originalAmount * annual.years * 100) / 100;
      fee.notes = `${fee.notes} | annual x ${annual.years} years`;

      // Update running amount
      state.runningAmount -= fee.amount - originalAmount;
    }

    return state;
  }

  /**
   * Calculate final transfer amounts and units
   */
  calculateFinalAmounts(state: FeeCalculationState, unitPrice: number) {
    // Sum positive fees (base fees)
    const transferPreDiscount = state.appliedFees
      .filter((f) => f.amount > 0)
      .reduce((sum, f) => sum + f.amount, 0);

    // Sum negative fees (discounts) - these are already negative
    const totalDiscounts = Math.abs(
      state.appliedFees
        .filter((f) => f.amount < 0)
        .reduce((sum, f) => sum + f.amount, 0)
    );

    // Final transfer amount
    const transferPostDiscount = transferPreDiscount - totalDiscounts;

    // Units calculation (always floor, no fractional units)
    const units = Math.floor(state.netAmount / unitPrice);

    return {
      transferPreDiscount: Math.round(transferPreDiscount * 100) / 100,
      totalDiscounts: Math.round(totalDiscounts * 100) / 100,
      transferPostDiscount: Math.round(transferPostDiscount * 100) / 100,
      units,
    };
  }

  /**
   * Validate fee calculation invariants
   */
  validateCalculation(
    state: FeeCalculationState,
    finalAmounts: ReturnType<typeof this.calculateFinalAmounts>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check precedence order (fees should be in order)
    const feesByPrecedence = state.appliedFees
      .filter((f) => f.amount > 0)
      .map((f) => f.component);

    // 2. Verify NET calculation
    const expectedNet = state.grossAmount - state.premiumAmount;
    if (Math.abs(state.netAmount - expectedNet) > 0.01) {
      errors.push(
        `Net amount mismatch: expected ${expectedNet}, got ${state.netAmount}`
      );
    }

    // 3. Verify discounts are negative
    const positiveDiscounts = state.appliedFees.filter(
      (f) => f.component.includes("_DISCOUNT") && f.amount >= 0
    );
    if (positiveDiscounts.length > 0) {
      errors.push(
        `Discounts must be negative: ${positiveDiscounts
          .map((d) => d.component)
          .join(", ")}`
      );
    }

    // 4. Verify transfer reconciliation
    const calculatedPost =
      finalAmounts.transferPreDiscount - finalAmounts.totalDiscounts;
    if (Math.abs(calculatedPost - finalAmounts.transferPostDiscount) > 0.01) {
      errors.push(
        `Transfer reconciliation failed: ${calculatedPost} != ${finalAmounts.transferPostDiscount}`
      );
    }

    // 5. Check for rounding (all amounts should be 2 decimal places)
    const unroundedAmounts = state.appliedFees.filter(
      (f) => f.amount !== Math.round(f.amount * 100) / 100
    );
    if (unroundedAmounts.length > 0) {
      warnings.push(
        `Unrounded amounts detected: ${unroundedAmounts.length} fees`
      );
    }

    // 6. Verify units are integers
    if (!Number.isInteger(finalAmounts.units)) {
      errors.push(`Units must be integers: ${finalAmounts.units}`);
    }

    // 7. Check for premium as first fee
    const firstPositiveFee = state.appliedFees.find((f) => f.amount > 0);
    if (firstPositiveFee && firstPositiveFee.component !== "PREMIUM") {
      warnings.push(
        `Premium should be first fee, found: ${firstPositiveFee.component}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Main calculation method with full audit trail
   */
  async calculate(
    dealId: number,
    grossCapital: number,
    unitPrice: number,
    options: {
      discounts?: DiscountInput[];
      annualFees?: Array<{ component: string; years: number }>;
      validateOnly?: boolean;
    } = {}
  ): Promise<FeeCalculationResult> {
    // 1. Load active fee schedule
    const schedule = await this.loadActiveFeeSchedule(dealId);

    if (schedule.length === 0) {
      throw new Error(`No active fee schedule found for deal ${dealId}`);
    }

    // 2. Calculate base fees in precedence order
    let state = this.calculateFeesWithPrecedence(schedule, grossCapital);

    // 3. Apply annual fee multipliers if specified
    if (options.annualFees && options.annualFees.length > 0) {
      state = this.applyAnnualFees(state, options.annualFees);
    }

    // 4. Apply discounts as negative rows
    if (options.discounts && options.discounts.length > 0) {
      state = this.applyDiscounts(state, options.discounts);
    }

    // 5. Calculate final amounts
    const finalAmounts = this.calculateFinalAmounts(state, unitPrice);

    // 6. Validate invariants
    const validation = this.validateCalculation(state, finalAmounts);

    // 7. Generate audit metadata
    const metadata = {
      scheduleVersion: schedule[0]?.version,
      precedenceOrder: schedule.map((s) => s.component).join(" -> "),
      calculationDate: new Date(),
      auditId: this.generateAuditId(),
    };

    return {
      state,
      ...finalAmounts,
      validation,
      metadata,
    };
  }

  /**
   * Persist calculation to database
   */
  async persistCalculation(
    transactionId: number,
    calculation: FeeCalculationResult
  ): Promise<void> {
    if (!calculation.validation.valid) {
      throw new Error(
        `Cannot persist invalid calculation: ${calculation.validation.errors.join(
          ", "
        )}`
      );
    }

    const supabase = this.client.getClient();

    // Resolve deal_id from transaction for persistence compatibility
    const { data: txMeta, error: txErr } = await supabase
      .from("transactions.transaction.primary")
      .select("deal_id")
      .eq("transaction_id", transactionId)
      .single();

    if (txErr || !txMeta) {
      throw new Error(
        `Cannot persist fees: transaction ${transactionId} not found to resolve deal_id`
      );
    }

    // Persist one record per base fee component, aggregating discount rows
    // into discount_percent/discount_amount columns and preserving full context in notes
    const positiveFees = calculation.state.appliedFees.filter(
      (f) => f.amount > 0
    );
    const discountFees = calculation.state.appliedFees.filter(
      (f) => f.amount < 0
    );

    const records = positiveFees.map((baseFee) => {
      const baseComponent = baseFee.component;
      const relatedDiscounts = discountFees.filter(
        (d) => d.component.replace("_DISCOUNT", "") === baseComponent
      );

      // Compute discount aggregates
      const percentDiscounts = relatedDiscounts
        .map((d) => (typeof d.percent === "number" ? d.percent : null))
        .filter((p): p is number => p !== null);
      const fixedDiscountTotalAbs = relatedDiscounts
        .map((d) => Math.abs(d.amount))
        .reduce((sum, v) => sum + v, 0);

      // Persist basis as NET when internally using NET_AFTER_PREMIUM, but retain context in notes
      const basisPersist =
        baseFee.basis === "NET_AFTER_PREMIUM"
          ? "NET"
          : baseFee.basis || "GROSS";

      // If exactly one percent discount and no mixed types, store it; otherwise carry details in notes only
      const hasOnlyOnePercent =
        percentDiscounts.length === 1 && fixedDiscountTotalAbs === 0;
      const discount_percent = hasOnlyOnePercent ? percentDiscounts[0] : null;
      const discount_amount =
        fixedDiscountTotalAbs > 0 ? fixedDiscountTotalAbs : null;

      const notes = JSON.stringify({
        auditId: calculation.metadata.auditId,
        scheduleVersion: calculation.metadata.scheduleVersion,
        precedence: calculation.metadata.precedenceOrder,
        basis_context: baseFee.basis,
        discounts: relatedDiscounts.map((d) => ({
          component: d.component,
          percent: d.percent ?? null,
          amount: Math.abs(d.amount),
        })),
        calculationDate: calculation.metadata.calculationDate,
      });

      return {
        transaction_id: transactionId,
        deal_id: txMeta.deal_id,
        component: baseComponent,
        amount: baseFee.amount,
        percent: baseFee.percent ?? null,
        applied: true,
        notes,
        created_at: new Date().toISOString(),
      };
    });

    // Insert all base fee records (discounts aggregated per component)
    const { error } = await supabase
      .from("fee_application_record")
      .insert(records);

    if (error) {
      throw new Error(`Failed to persist fees: ${error.message}`);
    }
  }

  /**
   * Calculate fees for existing transaction
   */
  async calculateForTransaction(
    transactionId: number
  ): Promise<FeeCalculationResult> {
    const supabase = this.client.getClient();

    // Get transaction details
    const { data: transaction, error } = await supabase
      .from("transactions.transaction.primary")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error || !transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Get any existing discounts for this investor
    const { data: existingDiscounts } = await supabase
      .from("fees.legacy_import")
      .select("*")
      .eq("transaction_id", transactionId)
      .like("component", "%_DISCOUNT");

    // Convert to discount inputs
    const discounts: DiscountInput[] = (existingDiscounts || []).map((d) => ({
      component: d.component,
      percent: d.percent ? parseFloat(d.percent) : undefined,
      amount: d.amount ? parseFloat(d.amount) : undefined,
      basis: d.basis,
    }));

    // Calculate fees
    return this.calculate(
      transaction.deal_id,
      parseFloat(transaction.gross_capital),
      parseFloat(transaction.unit_price),
      { discounts }
    );
  }

  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    return `FEE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Preview calculation without persisting
   */
  async preview(
    dealId: number,
    grossCapital: number,
    unitPrice: number,
    options: Parameters<typeof this.calculate>[3] = {}
  ): Promise<FeeCalculationResult> {
    return this.calculate(dealId, grossCapital, unitPrice, {
      ...options,
      validateOnly: true,
    });
  }

  /**
   * Batch calculate for multiple transactions
   */
  async batchCalculate(
    transactions: Array<{
      transaction_id?: number;
      deal_id: number;
      gross_capital: number;
      unit_price: number;
      discounts?: DiscountInput[];
    }>
  ): Promise<FeeCalculationResult[]> {
    // Group by deal to reuse schedules
    const byDeal = new Map<number, typeof transactions>();

    for (const tx of transactions) {
      const dealTxs = byDeal.get(tx.deal_id) || [];
      dealTxs.push(tx);
      byDeal.set(tx.deal_id, dealTxs);
    }

    const results: FeeCalculationResult[] = [];

    // Process each deal group
    for (const [dealId, dealTxs] of byDeal) {
      // Load schedule once per deal
      const schedule = await this.loadActiveFeeSchedule(dealId);

      for (const tx of dealTxs) {
        // Calculate using cached schedule
        let state = this.calculateFeesWithPrecedence(
          schedule,
          tx.gross_capital
        );

        if (tx.discounts) {
          state = this.applyDiscounts(state, tx.discounts);
        }

        const finalAmounts = this.calculateFinalAmounts(state, tx.unit_price);
        const validation = this.validateCalculation(state, finalAmounts);

        results.push({
          state,
          ...finalAmounts,
          validation,
          metadata: {
            scheduleVersion: schedule[0]?.version,
            precedenceOrder: schedule.map((s) => s.component).join(" -> "),
            calculationDate: new Date(),
            auditId: this.generateAuditId(),
          },
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const enhancedFeeCalculator = new EnhancedFeeCalculator();
