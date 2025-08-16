// CSV Import Validation and Processing

import { CSVImportRow, FeeValidationError, FeeComponent, FeeBasis } from './types';

export class CSVValidator {
  private errors: FeeValidationError[] = [];
  
  /**
   * Validate and parse CSV content
   */
  validateCSV(csvContent: string): { 
    valid: boolean; 
    rows: CSVImportRow[]; 
    errors: FeeValidationError[] 
  } {
    this.errors = [];
    const rows: CSVImportRow[] = [];
    
    // Parse CSV
    const lines = csvContent.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    
    if (lines.length === 0) {
      this.addError(0, 'file', '', 'CSV file is empty');
      return { valid: false, rows: [], errors: this.errors };
    }
    
    // Parse header
    const header = this.parseCSVLine(lines[0]);
    const requiredColumns = ['deal_id', 'component'];
    const optionalColumns = ['transaction_id', 'basis', 'percent', 'amount', 'notes', 'source_file'];
    
    // Validate header
    for (const col of requiredColumns) {
      if (!header.includes(col)) {
        this.addError(0, 'header', header.join(','), `Missing required column: ${col}`);
      }
    }
    
    if (this.errors.length > 0) {
      return { valid: false, rows: [], errors: this.errors };
    }
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const cells = this.parseCSVLine(lines[i]);
      const row: any = {};
      
      // Map cells to columns
      header.forEach((col, idx) => {
        const value = cells[idx]?.trim();
        row[col] = value === '' ? null : value;
      });
      
      // Validate and convert row
      const validatedRow = this.validateRow(row, i + 1);
      if (validatedRow) {
        rows.push(validatedRow);
      }
    }
    
    return {
      valid: this.errors.length === 0,
      rows,
      errors: this.errors
    };
  }
  
  /**
   * Parse a CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  }
  
  /**
   * Validate a single row
   */
  private validateRow(row: any, rowNum: number): CSVImportRow | null {
    const validated: CSVImportRow = {
      deal_id: 0,
      component: '',
      transaction_id: undefined,
      basis: undefined,
      percent: undefined,
      amount: undefined,
      notes: undefined,
      source_file: undefined
    };
    
    // Validate deal_id (required)
    if (!row.deal_id) {
      this.addError(rowNum, 'deal_id', row.deal_id, 'Deal ID is required');
      return null;
    }
    const dealId = parseInt(row.deal_id);
    if (isNaN(dealId) || dealId <= 0) {
      this.addError(rowNum, 'deal_id', row.deal_id, 'Deal ID must be a positive number');
      return null;
    }
    validated.deal_id = dealId;
    
    // Validate component (required)
    if (!row.component) {
      this.addError(rowNum, 'component', row.component, 'Component is required');
      return null;
    }
    const component = row.component.toUpperCase();
    const validComponents: FeeComponent[] = [
      'MANAGEMENT', 'PERFORMANCE', 'STRUCTURING', 
      'ADMIN', 'PREMIUM', 'ADVISORY', 'PLACEMENT', 'MONITORING'
    ];
    if (!validComponents.includes(component as FeeComponent)) {
      this.addError(rowNum, 'component', row.component, `Invalid component. Must be one of: ${validComponents.join(', ')}`);
      return null;
    }
    validated.component = component;
    
    // Validate transaction_id (optional)
    if (row.transaction_id) {
      const txId = parseInt(row.transaction_id);
      if (isNaN(txId) || txId <= 0) {
        this.addError(rowNum, 'transaction_id', row.transaction_id, 'Transaction ID must be a positive number');
        return null;
      }
      validated.transaction_id = txId;
    }
    
    // Validate basis (optional)
    if (row.basis) {
      const basis = row.basis.toUpperCase();
      const validBasis: FeeBasis[] = [
        'GROSS_CAPITAL', 'NET_CAPITAL', 'COMMITTED_CAPITAL',
        'DEPLOYED_CAPITAL', 'NAV', 'PROFIT', 'FIXED'
      ];
      if (!validBasis.includes(basis as FeeBasis)) {
        this.addError(rowNum, 'basis', row.basis, `Invalid basis. Must be one of: ${validBasis.join(', ')}`);
        return null;
      }
      validated.basis = basis;
    }
    
    // Validate percent (optional)
    if (row.percent) {
      const percent = parseFloat(row.percent);
      if (isNaN(percent)) {
        this.addError(rowNum, 'percent', row.percent, 'Percent must be a number');
        return null;
      }
      if (percent < 0 || percent > 100) {
        this.addError(rowNum, 'percent', row.percent, 'Percent must be between 0 and 100');
        return null;
      }
      validated.percent = percent;
    }
    
    // Validate amount (optional)
    if (row.amount) {
      const amount = parseFloat(row.amount);
      if (isNaN(amount)) {
        this.addError(rowNum, 'amount', row.amount, 'Amount must be a number');
        return null;
      }
      if (amount < 0) {
        this.addError(rowNum, 'amount', row.amount, 'Amount cannot be negative');
        return null;
      }
      validated.amount = amount;
    }
    
    // Validate: must have either percent or amount
    if (!validated.percent && !validated.amount) {
      this.addError(rowNum, 'percent/amount', '', 'Either percent or amount must be provided');
      return null;
    }
    
    // Copy optional fields
    validated.notes = row.notes || undefined;
    validated.source_file = row.source_file || 'upload.csv';
    
    return validated;
  }
  
  /**
   * Add validation error
   */
  private addError(row: number, field: string, value: any, error: string) {
    this.errors.push({ row, field, value, error });
  }
  
  /**
   * Generate sample CSV template
   */
  static generateTemplate(): string {
    const header = 'deal_id,transaction_id,component,basis,percent,amount,notes,source_file';
    const samples = [
      '1001,,MANAGEMENT,GROSS_CAPITAL,2.0,,Annual management fee,legacy_fees.csv',
      '1001,5001,STRUCTURING,GROSS_CAPITAL,1.5,,Deal structuring fee,legacy_fees.csv',
      '1002,5002,PERFORMANCE,PROFIT,20.0,,Performance carry,legacy_fees.csv',
      '1003,,ADMIN,FIXED,,50000,Fixed admin fee,legacy_fees.csv',
      '1004,5004,ADVISORY,NET_CAPITAL,0.5,,Advisory fee,legacy_fees.csv'
    ];
    
    return [header, ...samples].join('\n');
  }
  
  /**
   * Format validation errors for display
   */
  static formatErrors(errors: FeeValidationError[]): string {
    if (errors.length === 0) return 'No errors';
    
    const grouped = errors.reduce((acc, err) => {
      const key = `Row ${err.row}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(`${err.field}: ${err.error}`);
      return acc;
    }, {} as Record<string, string[]>);
    
    return Object.entries(grouped)
      .map(([row, errs]) => `${row}:\n  - ${errs.join('\n  - ')}`)
      .join('\n\n');
  }
}