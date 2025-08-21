/**
 * Formula Parser and Executor
 * Safely parses and executes mathematical formulas from database
 */

export interface FormulaVariable {
  code: string;
  value: number;
}

export interface FormulaContext {
  variables: Map<string, number>;
  functions: Map<string, Function>;
}

export class FormulaParser {
  private context: FormulaContext;

  constructor() {
    this.context = {
      variables: new Map(),
      functions: new Map([
        ['MIN', Math.min],
        ['MAX', Math.max],
        ['ABS', Math.abs],
        ['ROUND', Math.round],
        ['CEIL', Math.ceil],
        ['FLOOR', Math.floor],
        ['POW', Math.pow],
        ['SQRT', Math.sqrt],
      ])
    };
  }

  /**
   * Set variables for formula execution
   */
  setVariables(variables: FormulaVariable[]): void {
    this.context.variables.clear();
    variables.forEach(v => {
      this.context.variables.set(v.code, v.value);
    });
  }

  /**
   * Parse and execute a formula string
   */
  execute(formula: string): number {
    if (!formula) {
      throw new Error('Formula is empty');
    }

    try {
      // Replace variables with values
      let processedFormula = this.replaceVariables(formula);
      
      // Handle special functions
      processedFormula = this.processFunctions(processedFormula);
      
      // Safely evaluate the formula
      return this.safeEval(processedFormula);
    } catch (error) {
      throw new Error(`Formula execution failed: ${error.message}\nFormula: ${formula}`);
    }
  }

  /**
   * Replace variable codes with their values
   */
  private replaceVariables(formula: string): string {
    let result = formula;
    
    // Sort variables by length (descending) to avoid partial replacements
    const sortedVars = Array.from(this.context.variables.entries())
      .sort((a, b) => b[0].length - a[0].length);
    
    sortedVars.forEach(([code, value]) => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${code}\\b`, 'g');
      result = result.replace(regex, value.toString());
    });
    
    return result;
  }

  /**
   * Process special functions in the formula
   */
  private processFunctions(formula: string): string {
    let result = formula;
    
    // Process MIN/MAX functions
    result = result.replace(/MIN\(([^,]+),([^)]+)\)/g, (match, a, b) => {
      return `Math.min(${a},${b})`;
    });
    
    result = result.replace(/MAX\(([^,]+),([^)]+)\)/g, (match, a, b) => {
      return `Math.max(${a},${b})`;
    });
    
    // Process other math functions
    result = result.replace(/ABS\(([^)]+)\)/g, 'Math.abs($1)');
    result = result.replace(/ROUND\(([^)]+)\)/g, 'Math.round($1)');
    result = result.replace(/CEIL\(([^)]+)\)/g, 'Math.ceil($1)');
    result = result.replace(/FLOOR\(([^)]+)\)/g, 'Math.floor($1)');
    result = result.replace(/SQRT\(([^)]+)\)/g, 'Math.sqrt($1)');
    result = result.replace(/POW\(([^,]+),([^)]+)\)/g, 'Math.pow($1,$2)');
    
    return result;
  }

  /**
   * Safely evaluate mathematical expression
   */
  private safeEval(expression: string): number {
    // Validate expression contains only allowed characters
    const allowedChars = /^[0-9+\-*/().,\s]|Math\.\w+/;
    const cleanExpression = expression.replace(/Math\.\w+/g, '');
    
    if (!/^[0-9+\-*/().,\s]+$/.test(cleanExpression)) {
      throw new Error(`Invalid characters in expression: ${expression}`);
    }
    
    try {
      // Create a safe evaluation context
      const func = new Function('Math', `return ${expression}`);
      const result = func(Math);
      
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Formula did not evaluate to a valid number');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Evaluation failed: ${error.message}`);
    }
  }

  /**
   * Validate formula syntax without executing
   */
  validateFormula(formula: string): { valid: boolean; error?: string } {
    try {
      // Check for balanced parentheses
      let depth = 0;
      for (const char of formula) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (depth < 0) {
          return { valid: false, error: 'Unbalanced parentheses' };
        }
      }
      if (depth !== 0) {
        return { valid: false, error: 'Unbalanced parentheses' };
      }
      
      // Check for valid variable names
      const variablePattern = /\b[A-Z][A-Z0-9_]*\b/g;
      const matches = formula.match(variablePattern) || [];
      
      for (const match of matches) {
        // Skip function names
        if (this.context.functions.has(match)) continue;
        
        // Check if it's followed by a parenthesis (function call)
        const funcPattern = new RegExp(`${match}\\s*\\(`);
        if (funcPattern.test(formula)) {
          if (!this.context.functions.has(match)) {
            return { valid: false, error: `Unknown function: ${match}` };
          }
        }
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Extract variable codes from a formula
   */
  extractVariables(formula: string): string[] {
    const variablePattern = /\b[A-Z][A-Z0-9_]*\b/g;
    const matches = formula.match(variablePattern) || [];
    
    // Filter out function names
    const variables = matches.filter(match => {
      // Check if it's a function
      if (this.context.functions.has(match)) return false;
      
      // Check if it's followed by a parenthesis
      const funcPattern = new RegExp(`${match}\\s*\\(`);
      return !funcPattern.test(formula);
    });
    
    // Return unique variables
    return [...new Set(variables)];
  }
}

/**
 * Formula Executor - Higher level service for executing formulas with database values
 */
export class FormulaExecutor {
  private parser: FormulaParser;

  constructor() {
    this.parser = new FormulaParser();
  }

  /**
   * Execute a formula with provided variables
   */
  async calculate(
    formula: string, 
    variables: Record<string, number>
  ): Promise<number> {
    // Convert variables to array format
    const varArray: FormulaVariable[] = Object.entries(variables).map(([code, value]) => ({
      code,
      value: value || 0
    }));
    
    // Set variables in parser
    this.parser.setVariables(varArray);
    
    // Execute formula
    return this.parser.execute(formula);
  }

  /**
   * Execute multiple formulas and return results
   */
  async calculateMultiple(
    formulas: Record<string, string>,
    variables: Record<string, number>
  ): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    
    for (const [key, formula] of Object.entries(formulas)) {
      if (formula) {
        results[key] = await this.calculate(formula, variables);
      }
    }
    
    return results;
  }

  /**
   * Calculate deal economics using formulas
   */
  async calculateDealEconomics(
    formulas: {
      nc_formula: string;
      investor_proceeds_formula: string;
      investor_proceeds_discount_formula: string;
      eq_proceeds_formula?: string;
      eq_proceeds_discount_formula?: string;
    },
    variables: Record<string, number>
  ): Promise<{
    netCapital: number;
    investorProceeds: number;
    investorProceedsDiscounted: number;
    eqProceeds?: number;
    eqProceedsDiscounted?: number;
    totalFees: number;
    totalFeesDiscounted: number;
    irr?: number;
    moic?: number;
  }> {
    // Calculate net capital first
    const netCapital = await this.calculate(formulas.nc_formula, variables);
    
    // Update variables with calculated NC
    const updatedVars = { ...variables, NC: netCapital };
    
    // Calculate proceeds
    const investorProceeds = await this.calculate(
      formulas.investor_proceeds_formula, 
      updatedVars
    );
    
    const investorProceedsDiscounted = await this.calculate(
      formulas.investor_proceeds_discount_formula, 
      updatedVars
    );
    
    // Calculate partner proceeds if applicable
    let eqProceeds: number | undefined;
    let eqProceedsDiscounted: number | undefined;
    
    if (formulas.eq_proceeds_formula && updatedVars.NCP) {
      eqProceeds = await this.calculate(formulas.eq_proceeds_formula, updatedVars);
      eqProceedsDiscounted = await this.calculate(
        formulas.eq_proceeds_discount_formula!, 
        updatedVars
      );
    }
    
    // Calculate total fees
    const grossProceeds = updatedVars.NC * (updatedVars.EUP / updatedVars.IUP);
    const totalFees = grossProceeds - investorProceeds;
    const totalFeesDiscounted = grossProceeds - investorProceedsDiscounted;
    
    // Calculate IRR and MOIC
    const years = updatedVars.T || 1;
    const moic = investorProceeds / netCapital;
    const irr = Math.pow(moic, 1 / years) - 1;
    
    return {
      netCapital,
      investorProceeds,
      investorProceedsDiscounted,
      eqProceeds,
      eqProceedsDiscounted,
      totalFees,
      totalFeesDiscounted,
      irr: irr * 100, // Convert to percentage
      moic
    };
  }

  /**
   * Validate a formula
   */
  validate(formula: string): { valid: boolean; error?: string } {
    return this.parser.validateFormula(formula);
  }

  /**
   * Extract required variables from a formula
   */
  getRequiredVariables(formula: string): string[] {
    return this.parser.extractVariables(formula);
  }
}