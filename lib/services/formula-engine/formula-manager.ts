/**
 * Formula Manager Service
 * Manages CRUD operations for formula templates and variables
 */

import { createClient } from '@supabase/supabase-js';
import { FormulaExecutor } from './formula-parser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface FormulaTemplate {
  id: number;
  formula_code: string;
  formula_name: string;
  description: string;
  nc_formula: string;
  investor_proceeds_formula: string;
  investor_proceeds_discount_formula: string;
  eq_proceeds_formula?: string;
  eq_proceeds_discount_formula?: string;
  has_dual_mgmt_fee: boolean;
  has_premium: boolean;
  has_structuring: boolean;
  has_other_fees: boolean;
  mgmt_fee_split_year?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormulaVariable {
  id: number;
  variable_code: string;
  variable_name: string;
  description: string;
  data_type: 'numeric' | 'percentage' | 'currency' | 'years';
  unit: string;
  category: 'capital' | 'fee' | 'price' | 'discount' | 'time' | 'return';
}

export interface DealVariableValue {
  deal_id: number;
  investor_id?: number;
  variable_code: string;
  value: number;
  effective_date: string;
  source: 'manual' | 'calculated' | 'imported' | 'default';
}

export interface CalculationAudit {
  id: number;
  deal_id: number;
  investor_id?: number;
  calculation_type: string;
  formula_template_id: number;
  formula_used: string;
  variables_snapshot: Record<string, number>;
  result: number;
  result_details: any;
  calculated_at: string;
  calculated_by?: string;
}

export class FormulaManager {
  private supabase;
  private executor: FormulaExecutor;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.executor = new FormulaExecutor();
  }

  // ==================== Formula Template CRUD ====================

  /**
   * Get all formula templates
   */
  async getFormulaTemplates(activeOnly = true): Promise<FormulaTemplate[]> {
    let query = this.supabase
      .from('deal_formula_templates')
      .select('*')
      .order('formula_name');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching formula templates:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific formula template
   */
  async getFormulaTemplate(id: number): Promise<FormulaTemplate | null> {
    const { data, error } = await this.supabase
      .from('deal_formula_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching formula template:', error);
      return null;
    }

    return data;
  }

  /**
   * Get formula template by code
   */
  async getFormulaTemplateByCode(code: string): Promise<FormulaTemplate | null> {
    const { data, error } = await this.supabase
      .from('deal_formula_templates')
      .select('*')
      .eq('formula_code', code)
      .single();

    if (error) {
      console.error('Error fetching formula template by code:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new formula template
   */
  async createFormulaTemplate(template: Omit<FormulaTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<FormulaTemplate> {
    // Validate formulas before saving
    const validations = [
      this.executor.validate(template.nc_formula),
      this.executor.validate(template.investor_proceeds_formula),
      this.executor.validate(template.investor_proceeds_discount_formula),
    ];

    if (template.eq_proceeds_formula) {
      validations.push(this.executor.validate(template.eq_proceeds_formula));
    }
    if (template.eq_proceeds_discount_formula) {
      validations.push(this.executor.validate(template.eq_proceeds_discount_formula));
    }

    const invalidFormula = validations.find(v => !v.valid);
    if (invalidFormula) {
      throw new Error(`Invalid formula: ${invalidFormula.error}`);
    }

    const { data, error } = await this.supabase
      .from('deal_formula_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      console.error('Error creating formula template:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a formula template
   */
  async updateFormulaTemplate(id: number, updates: Partial<FormulaTemplate>): Promise<FormulaTemplate> {
    // Validate any formula updates
    if (updates.nc_formula) {
      const validation = this.executor.validate(updates.nc_formula);
      if (!validation.valid) {
        throw new Error(`Invalid NC formula: ${validation.error}`);
      }
    }

    const { data, error } = await this.supabase
      .from('deal_formula_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating formula template:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a formula template (soft delete by setting is_active = false)
   */
  async deleteFormulaTemplate(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('deal_formula_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting formula template:', error);
      return false;
    }

    return true;
  }

  // ==================== Formula Variables ====================

  /**
   * Get all formula variables
   */
  async getFormulaVariables(): Promise<FormulaVariable[]> {
    const { data, error } = await this.supabase
      .from('formula_variables')
      .select('*')
      .order('category, variable_code');

    if (error) {
      console.error('Error fetching formula variables:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get variables by category
   */
  async getVariablesByCategory(category: string): Promise<FormulaVariable[]> {
    const { data, error } = await this.supabase
      .from('formula_variables')
      .select('*')
      .eq('category', category)
      .order('variable_code');

    if (error) {
      console.error('Error fetching variables by category:', error);
      throw error;
    }

    return data || [];
  }

  // ==================== Deal Variable Values ====================

  /**
   * Get variable values for a deal
   */
  async getDealVariables(dealId: number, investorId?: number): Promise<Record<string, number>> {
    let query = this.supabase
      .from('deal_variable_values')
      .select('variable_code, value')
      .eq('deal_id', dealId);

    if (investorId) {
      query = query.eq('investor_id', investorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching deal variables:', error);
      throw error;
    }

    // Convert to Record format
    const variables: Record<string, number> = {};
    data?.forEach(item => {
      variables[item.variable_code] = item.value;
    });

    return variables;
  }

  /**
   * Set variable values for a deal
   */
  async setDealVariables(
    dealId: number, 
    variables: Record<string, number>, 
    investorId?: number,
    source: 'manual' | 'calculated' | 'imported' | 'default' = 'manual'
  ): Promise<boolean> {
    const values = Object.entries(variables).map(([variable_code, value]) => ({
      deal_id: dealId,
      investor_id: investorId,
      variable_code,
      value,
      source,
      effective_date: new Date().toISOString().split('T')[0]
    }));

    const { error } = await this.supabase
      .from('deal_variable_values')
      .upsert(values, {
        onConflict: 'deal_id,investor_id,variable_code,effective_date'
      });

    if (error) {
      console.error('Error setting deal variables:', error);
      return false;
    }

    return true;
  }

  // ==================== Deal Formula Assignment ====================

  /**
   * Assign a formula template to a deal
   */
  async assignFormulaToDeal(dealId: number, formulaTemplateId: number): Promise<boolean> {
    // First update the deals table
    const { error: dealError } = await this.supabase
      .from('deals')
      .update({ formula_template_id: formulaTemplateId })
      .eq('id', dealId);

    if (dealError) {
      console.error('Error updating deal formula:', dealError);
      return false;
    }

    // Then create an assignment record
    const { error: assignError } = await this.supabase
      .from('deal_formula_assignments')
      .insert({
        deal_id: dealId,
        formula_template_id: formulaTemplateId,
        effective_date: new Date().toISOString().split('T')[0],
        is_active: true
      });

    if (assignError) {
      console.error('Error creating formula assignment:', assignError);
      return false;
    }

    return true;
  }

  /**
   * Get the active formula for a deal
   */
  async getDealFormula(dealId: number): Promise<FormulaTemplate | null> {
    // First check deals table
    const { data: deal, error: dealError } = await this.supabase
      .from('deals')
      .select('formula_template_id')
      .eq('id', dealId)
      .single();

    if (dealError || !deal?.formula_template_id) {
      // Try to get from assignments
      const { data: assignment, error: assignError } = await this.supabase
        .from('deal_formula_assignments')
        .select('formula_template_id')
        .eq('deal_id', dealId)
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (assignError || !assignment) {
        return null;
      }

      return this.getFormulaTemplate(assignment.formula_template_id);
    }

    return this.getFormulaTemplate(deal.formula_template_id);
  }

  // ==================== Calculation & Audit ====================

  /**
   * Calculate deal economics and store in audit log
   */
  async calculateAndAudit(
    dealId: number,
    investorId?: number,
    transactionId?: number
  ): Promise<CalculationAudit> {
    // Get formula template
    const formula = await this.getDealFormula(dealId);
    if (!formula) {
      throw new Error('No formula assigned to deal');
    }

    // Get variables
    const variables = await this.getDealVariables(dealId, investorId);

    // Calculate economics
    const results = await this.executor.calculateDealEconomics(
      {
        nc_formula: formula.nc_formula,
        investor_proceeds_formula: formula.investor_proceeds_formula,
        investor_proceeds_discount_formula: formula.investor_proceeds_discount_formula,
        eq_proceeds_formula: formula.eq_proceeds_formula,
        eq_proceeds_discount_formula: formula.eq_proceeds_discount_formula
      },
      variables
    );

    // Store in audit log
    const { data, error } = await this.supabase
      .from('calculation_audit_log')
      .insert({
        deal_id: dealId,
        investor_id: investorId,
        transaction_id: transactionId,
        calculation_type: 'deal_economics',
        formula_template_id: formula.id,
        formula_used: formula.nc_formula,
        variables_snapshot: variables,
        result: results.investorProceeds,
        result_details: results
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing calculation audit:', error);
      throw error;
    }

    return data;
  }

  /**
   * Test a formula with sample data
   */
  async testFormula(
    formula: string,
    sampleVariables: Record<string, number>
  ): Promise<{ success: boolean; result?: number; error?: string }> {
    try {
      // Validate formula
      const validation = this.executor.validate(formula);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Execute with sample data
      const result = await this.executor.calculate(formula, sampleVariables);
      
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get calculation history for a deal
   */
  async getCalculationHistory(
    dealId: number,
    investorId?: number,
    limit = 10
  ): Promise<CalculationAudit[]> {
    let query = this.supabase
      .from('calculation_audit_log')
      .select('*')
      .eq('deal_id', dealId)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    if (investorId) {
      query = query.eq('investor_id', investorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching calculation history:', error);
      throw error;
    }

    return data || [];
  }
}