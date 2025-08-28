'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface DealFormula {
  dealName: string;
  ncFormula: string;
  template: string;
  hasManagementTiers: boolean;
  hasPremium: boolean;
  hasOtherFees: boolean;
  feeBaseCapital: 'GC' | 'NC';
}

interface ValidationResult {
  field: string;
  status: 'present' | 'missing' | 'mismatch';
  supabaseValue?: any;
  formulaValue?: any;
  message?: string;
}

interface FormulaVariable {
  symbol: string;
  name: string;
  value: number;
  type: 'input' | 'calculated' | 'rate';
}

export default function FormulaValidator() {
  const [selectedDeal, setSelectedDeal] = useState('');
  const [variables, setVariables] = useState<FormulaVariable[]>([]);
  const [results, setResults] = useState<any>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'calculator' | 'gaps' | 'migration'>('calculator');

  // Deal templates based on formula analysis
  const dealTemplates: Record<string, DealFormula> = useMemo(() => ({
    'impossible-foods': {
      dealName: 'Impossible Foods',
      ncFormula: 'GC × (PMSP/ISP)',
      template: 'impossible',
      hasManagementTiers: false,
      hasPremium: false,
      hasOtherFees: false,
      feeBaseCapital: 'GC'
    },
    'reddit': {
      dealName: 'Reddit',
      ncFormula: 'GC',
      template: 'reddit',
      hasManagementTiers: false,
      hasPremium: true,
      hasOtherFees: true,
      feeBaseCapital: 'GC'
    },
    'openai': {
      dealName: 'OpenAI',
      ncFormula: '(GC × (1 - SFR)) × (PMSP/ISP)',
      template: 'openai',
      hasManagementTiers: true,
      hasPremium: false,
      hasOtherFees: false,
      feeBaseCapital: 'GC'
    },
    'figure-ai': {
      dealName: 'Figure AI',
      ncFormula: 'GC × (1 - SFR)',
      template: 'figure',
      hasManagementTiers: false,
      hasPremium: true,
      hasOtherFees: false,
      feeBaseCapital: 'GC'
    },
    'scout-ai': {
      dealName: 'Scout AI',
      ncFormula: 'GC',
      template: 'scout',
      hasManagementTiers: false,
      hasPremium: true,
      hasOtherFees: false,
      feeBaseCapital: 'GC'
    },
    'spacex-1': {
      dealName: 'SpaceX 1',
      ncFormula: 'GC / (1 + SFR)',
      template: 'spacex1',
      hasManagementTiers: true,
      hasPremium: true,
      hasOtherFees: false,
      feeBaseCapital: 'NC'
    },
    'spacex-2': {
      dealName: 'SpaceX 2',
      ncFormula: 'GC × (PMSP/ISP)',
      template: 'spacex2',
      hasManagementTiers: false,
      hasPremium: false,
      hasOtherFees: false,
      feeBaseCapital: 'GC'
    },
    'new-heights': {
      dealName: 'New Heights',
      ncFormula: 'GC',
      template: 'newheights',
      hasManagementTiers: false,
      hasPremium: false,
      hasOtherFees: false,
      feeBaseCapital: 'GC'
    },
    'egypt-growth': {
      dealName: 'Egypt Growth Vehicle',
      ncFormula: 'GC',
      template: 'egypt',
      hasManagementTiers: false,
      hasPremium: true,
      hasOtherFees: false,
      feeBaseCapital: 'GC'
    }
  }), []);

  // Initialize variables when deal changes
  useEffect(() => {
    if (selectedDeal && dealTemplates[selectedDeal]) {
      const template = dealTemplates[selectedDeal];
      const defaultVars: FormulaVariable[] = [
        { symbol: 'GC', name: 'Gross Capital', value: 100000, type: 'input' },
        { symbol: 'IUP', name: 'Initial Unit Price', value: 1000, type: 'input' },
        { symbol: 'EUP', name: 'Exit Unit Price', value: 2000, type: 'input' },
        { symbol: 'T', name: 'Years Held', value: 3, type: 'input' },
        { symbol: 'MFR', name: 'Management Fee Rate', value: 0.02, type: 'rate' },
        { symbol: 'SFR', name: 'Structuring Fee Rate', value: 0.025, type: 'rate' },
        { symbol: 'PFR', name: 'Performance Fee Rate', value: 0.20, type: 'rate' },
        { symbol: 'AF', name: 'Admin Fee', value: 350, type: 'input' }
      ];

      if (template.hasPremium) {
        defaultVars.push(
          { symbol: 'PMSP', name: 'Pre-Money Share Price', value: 950, type: 'input' },
          { symbol: 'ISP', name: 'Investor Share Price', value: 1000, type: 'input' }
        );
      }

      if (template.hasOtherFees) {
        defaultVars.push({ symbol: 'OF', name: 'Other Fees', value: 500, type: 'input' });
      }

      if (template.hasManagementTiers) {
        defaultVars.push(
          { symbol: 'MFR1', name: 'Mgmt Fee Year 1', value: 0.025, type: 'rate' },
          { symbol: 'MFR2', name: 'Mgmt Fee Year 2+', value: 0.02, type: 'rate' }
        );
      }

      setVariables(defaultVars);
    }
  }, [selectedDeal, dealTemplates]);

  const calculateFormulas = useCallback(() => {
    const template = dealTemplates[selectedDeal];
    if (!template) return;

    // Get variable values
    const vals = variables.reduce((acc, v) => {
      acc[v.symbol] = v.value;
      return acc;
    }, {} as Record<string, number>);

    // Calculate NC based on template
    let NC = vals.GC;
    switch (template.template) {
      case 'impossible':
      case 'spacex2':
        NC = vals.GC * (vals.PMSP / vals.ISP);
        break;
      case 'figure':
        NC = vals.GC * (1 - vals.SFR);
        break;
      case 'openai':
        NC = (vals.GC * (1 - vals.SFR)) * (vals.PMSP / vals.ISP);
        break;
      case 'spacex1':
        NC = vals.GC / (1 + vals.SFR);
        break;
      // reddit, scout, newheights, egypt: NC = GC
    }

    // Calculate proceeds
    const proceeds = NC * (vals.EUP / vals.IUP);
    
    // Calculate fees
    let mgmtFee = 0;
    if (template.hasManagementTiers && template.template === 'spacex1') {
      mgmtFee = (vals.MFR1 * NC * Math.min(vals.T, 2)) + 
                (vals.MFR2 * NC * Math.max(vals.T - 2, 0));
    } else if (template.hasManagementTiers) {
      mgmtFee = (vals.MFR1 * vals.GC) + (vals.MFR2 * vals.GC * (vals.T - 1));
    } else {
      mgmtFee = vals.MFR * vals.GC * vals.T;
    }

    const structFee = template.feeBaseCapital === 'NC' 
      ? vals.SFR * NC 
      : vals.SFR * vals.GC;

    let premium = 0;
    if (template.hasPremium && vals.PMSP && vals.ISP) {
      premium = vals.GC - (vals.GC * (vals.PMSP / vals.ISP));
    }

    const adminFee = vals.AF || 0;
    const otherFees = vals.OF || 0;
    const perfFee = vals.PFR * Math.max(0, proceeds - NC);

    const netProceeds = proceeds - mgmtFee - structFee - premium - adminFee - otherFees - perfFee;
    const totalFees = mgmtFee + structFee + premium + adminFee + otherFees + perfFee;
    const moic = netProceeds / vals.GC;
    const irr = Math.pow(moic, 1 / vals.T) - 1;

    setResults({
      NC: NC.toFixed(2),
      proceeds: proceeds.toFixed(2),
      mgmtFee: mgmtFee.toFixed(2),
      structFee: structFee.toFixed(2),
      premium: premium.toFixed(2),
      adminFee: adminFee.toFixed(2),
      otherFees: otherFees.toFixed(2),
      perfFee: perfFee.toFixed(2),
      totalFees: totalFees.toFixed(2),
      netProceeds: netProceeds.toFixed(2),
      moic: moic.toFixed(3),
      irr: (irr * 100).toFixed(2) + '%'
    });
  }, [dealTemplates, selectedDeal, variables]);

  const validateSupabaseReadiness = useCallback(() => {
    const template = dealTemplates[selectedDeal];
    if (!template) return;

    const validation: ValidationResult[] = [];

    // Check core fields
    validation.push({
      field: 'deal_name',
      status: 'present',
      message: 'Standard field in deals_clean'
    });

    validation.push({
      field: 'nc_calculation_method',
      status: 'missing',
      message: `Need enum for: ${template.ncFormula}`,
      formulaValue: template.template
    });

    // Check for tiered management fees
    if (template.hasManagementTiers) {
      validation.push({
        field: 'management_fee_tier_1',
        status: 'missing',
        message: 'Required for tiered fee deals'
      });
      validation.push({
        field: 'management_fee_tier_2',
        status: 'missing',
        message: 'Required for tiered fee deals'
      });
      validation.push({
        field: 'tier_1_period',
        status: 'missing',
        message: 'Years for first tier rate'
      });
    }

    // Check for other fees
    if (template.hasOtherFees) {
      validation.push({
        field: 'other_fees',
        status: 'missing',
        message: 'Required for Reddit-style deals'
      });
    }

    // Check fee base capital
    if (template.feeBaseCapital === 'NC') {
      validation.push({
        field: 'fee_base_capital',
        status: 'missing',
        message: 'Flag to determine if fees apply to GC or NC',
        formulaValue: template.feeBaseCapital
      });
    }

    // Premium calculation method
    if (template.hasPremium) {
      validation.push({
        field: 'premium_calculation_method',
        status: 'missing',
        message: 'Enum: valuation_based | unit_price_based | none'
      });
    }

    setValidationResults(validation);
  }, [dealTemplates, selectedDeal]);

  // Calculate formulas when variables change
  useEffect(() => {
    if (selectedDeal && variables.length > 0) {
      calculateFormulas();
      validateSupabaseReadiness();
    }
  }, [variables, selectedDeal, calculateFormulas, validateSupabaseReadiness]);

  const updateVariable = (symbol: string, value: number) => {
    setVariables(vars => 
      vars.map(v => v.symbol === symbol ? { ...v, value } : v)
    );
  };

  const generateMigrationScript = () => {
    const missingFields = validationResults.filter(v => v.status === 'missing');
    
    const script = `-- Migration Script for Formula Engine Support
-- Generated: ${new Date().toISOString()}

-- Add NC calculation method enum
CREATE TYPE nc_calculation_method AS ENUM (
  'standard',     -- NC = GC - (SFR × GC) - Premium
  'direct',       -- NC = GC
  'structured',   -- NC = GC × (1 - SFR)
  'premium_based',-- NC = GC × (PMSP/ISP)
  'complex',      -- NC = (GC × (1 - SFR)) × (PMSP/ISP)
  'inverse'       -- NC = GC / (1 + SFR)
);

-- Add premium calculation method enum
CREATE TYPE premium_calculation_method AS ENUM (
  'valuation_based',
  'unit_price_based',
  'none'
);

-- Add new columns to deals_clean
ALTER TABLE deals_clean
${missingFields.map(f => `  ADD COLUMN IF NOT EXISTS ${f.field} ${
  f.field.includes('method') ? 'nc_calculation_method' :
  f.field.includes('tier') && !f.field.includes('period') ? 'numeric(5,2)' :
  f.field === 'tier_1_period' ? 'integer DEFAULT 1' :
  f.field === 'fee_base_capital' ? "varchar(2) DEFAULT 'GC'" :
  f.field === 'other_fees' ? 'numeric(15,2) DEFAULT 0' :
  'text'
}`).join(',\n')};

-- Add formula template reference
ALTER TABLE deals_clean
  ADD COLUMN IF NOT EXISTS formula_template varchar(50);

-- Create formula templates table
CREATE TABLE IF NOT EXISTS formula_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name varchar(50) UNIQUE NOT NULL,
  nc_formula text NOT NULL,
  has_management_tiers boolean DEFAULT false,
  has_premium boolean DEFAULT false,
  has_other_fees boolean DEFAULT false,
  fee_base_capital varchar(2) DEFAULT 'GC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert known templates
INSERT INTO formula_templates (template_name, nc_formula, has_management_tiers, has_premium, has_other_fees, fee_base_capital)
VALUES 
  ('impossible', 'GC × (PMSP/ISP)', false, false, false, 'GC'),
  ('reddit', 'GC', false, true, true, 'GC'),
  ('openai', '(GC × (1 - SFR)) × (PMSP/ISP)', true, false, false, 'GC'),
  ('figure', 'GC × (1 - SFR)', false, true, false, 'GC'),
  ('scout', 'GC', false, true, false, 'GC'),
  ('spacex1', 'GC / (1 + SFR)', true, true, false, 'NC'),
  ('spacex2', 'GC × (PMSP/ISP)', false, false, false, 'GC'),
  ('newheights', 'GC', false, false, false, 'GC'),
  ('egypt', 'GC', false, true, false, 'GC')
ON CONFLICT (template_name) DO NOTHING;
`;

    return script;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          EquiTie Formula Validation Engine
        </h1>

        {/* Deal Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Deal Template
          </label>
          <select
            value={selectedDeal}
            onChange={(e) => setSelectedDeal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Deal --</option>
            {Object.entries(dealTemplates).map(([key, template]) => (
              <option key={key} value={key}>
                {template.dealName} (NC = {template.ncFormula})
              </option>
            ))}
          </select>
        </div>

        {selectedDeal && (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {['calculator', 'gaps', 'migration'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'calculator' && 'Formula Calculator'}
                    {tab === 'gaps' && 'Supabase Gaps'}
                    {tab === 'migration' && 'Migration Script'}
                  </button>
                ))}
              </nav>
            </div>

            {/* Calculator Tab */}
            {activeTab === 'calculator' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Variables Input */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Variables</h2>
                  <div className="space-y-3">
                    {variables.map(variable => (
                      <div key={variable.symbol} className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          {variable.name} ({variable.symbol})
                        </label>
                        <input
                          type="number"
                          value={variable.value}
                          onChange={(e) => updateVariable(variable.symbol, parseFloat(e.target.value) || 0)}
                          className="w-32 px-2 py-1 border border-gray-300 rounded"
                          step={variable.type === 'rate' ? 0.01 : variable.symbol === 'AF' ? 50 : 1000}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Calculation Results</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Net Capital (NC):</span>
                      <span className="font-mono">${results.NC}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Gross Proceeds:</span>
                      <span className="font-mono">${results.proceeds}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Management Fee:</span>
                        <span className="font-mono">-${results.mgmtFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Structuring Fee:</span>
                        <span className="font-mono">-${results.structFee}</span>
                      </div>
                      {results.premium > 0 && (
                        <div className="flex justify-between">
                          <span>Premium:</span>
                          <span className="font-mono">-${results.premium}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Admin Fee:</span>
                        <span className="font-mono">-${results.adminFee}</span>
                      </div>
                      {results.otherFees > 0 && (
                        <div className="flex justify-between">
                          <span>Other Fees:</span>
                          <span className="font-mono">-${results.otherFees}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Performance Fee:</span>
                        <span className="font-mono">-${results.perfFee}</span>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Net Proceeds:</span>
                      <span className="font-mono text-green-600">${results.netProceeds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Fees:</span>
                      <span className="font-mono text-red-600">${results.totalFees}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-medium">MOIC:</span>
                      <span className="font-mono">{results.moic}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">IRR:</span>
                      <span className="font-mono">{results.irr}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gaps Tab */}
            {activeTab === 'gaps' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Supabase Schema Gaps</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {validationResults.map((result, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm font-mono">{result.field}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.status === 'present' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{result.message}</td>
                          <td className="px-6 py-4 text-sm font-mono">{result.formulaValue || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Migration Tab */}
            {activeTab === 'migration' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Supabase Migration Script</h2>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generateMigrationScript()}</code>
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(generateMigrationScript())}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </>
        )}

        {/* Transaction Log */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Formula Calculation Log</h2>
          <div className="bg-gray-100 rounded p-4 font-mono text-xs">
            <div>{`// Deal: ${dealTemplates[selectedDeal]?.dealName ?? ''}`}</div>
            <div>{`// Template: ${dealTemplates[selectedDeal]?.template ?? ''}`}</div>
            <div>{`// NC Formula: ${dealTemplates[selectedDeal]?.ncFormula ?? ''}`}</div>
            <div>{`// Timestamp: ${new Date().toISOString()}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}