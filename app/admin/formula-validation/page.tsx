'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ValidationResult {
  transactionId: number;
  dealName: string;
  formulaTemplate: string;
  grossCapital: number;
  storedNC: number;
  calculatedNC: number;
  difference: number;
  percentDiff: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  pmsp?: number;
  isp?: number;
  sfr?: number;
}

export default function FormulaValidationDashboard() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    warned: 0,
    failed: 0
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadDeals = useCallback(async () => {
    const { data } = await supabase
      .from('deals_clean')
      .select('deal_id, deal_name, formula_template')
      .order('deal_id');
    
    setDeals(data || []);
    if (data && data.length > 0) {
      setSelectedDeal(data[0].deal_id);
    }
  }, [supabase]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const validateDeal = useCallback(async (dealId: number) => {
    setLoading(true);
    
    // Get deal info
    const { data: deal } = await supabase
      .from('deals_clean')
      .select('*')
      .eq('deal_id', dealId)
      .single();

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions_clean')
      .select('*')
      .eq('deal_id', dealId)
      .eq('transaction_type', 'primary')
      .order('transaction_id');

    const results: ValidationResult[] = [];
    let passed = 0, warned = 0, failed = 0;

    for (const tx of transactions || []) {
      const gc = parseFloat(tx.gross_capital);
      const storedNC = parseFloat(tx.initial_net_capital);
      let calculatedNC = gc;

      // Calculate NC based on formula
      switch (deal?.nc_calculation_method) {
        case 'premium_based':
          if (tx.pmsp && tx.isp && tx.isp > 0) {
            calculatedNC = gc * (tx.pmsp / tx.isp);
          }
          break;

        case 'sfr_based':
          if (tx.sfr) {
            calculatedNC = gc / (1 + tx.sfr);
          }
          break;

        case 'structured':
          if (tx.sfr) {
            calculatedNC = gc * (1 - tx.sfr);
          }
          break;

        case 'complex':
          if (tx.sfr !== null && tx.pmsp && tx.isp && tx.isp > 0) {
            calculatedNC = (gc * (1 - tx.sfr)) * (tx.pmsp / tx.isp);
          }
          break;

        case 'direct':
        case 'standard':
        default:
          calculatedNC = gc;
          break;
      }

      const difference = Math.abs(calculatedNC - storedNC);
      const percentDiff = storedNC > 0 ? (difference / storedNC) * 100 : 0;
      
      let status: 'PASS' | 'WARN' | 'FAIL';
      if (percentDiff < 1) {
        status = 'PASS';
        passed++;
      } else if (percentDiff < 5) {
        status = 'WARN';
        warned++;
      } else {
        status = 'FAIL';
        failed++;
      }

      results.push({
        transactionId: tx.transaction_id,
        dealName: deal?.deal_name || '',
        formulaTemplate: deal?.formula_template || '',
        grossCapital: gc,
        storedNC,
        calculatedNC,
        difference,
        percentDiff,
        status,
        pmsp: tx.pmsp,
        isp: tx.isp,
        sfr: tx.sfr
      });
    }

    setValidationResults(results);
    setStats({
      total: results.length,
      passed,
      warned,
      failed
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (selectedDeal) {
      validateDeal(selectedDeal);
    }
  }, [selectedDeal, validateDeal]);

  const recalculateAll = async () => {
    if (!selectedDeal) return;
    
    setLoading(true);
    
    for (const result of validationResults) {
      if (result.status !== 'PASS') {
        await supabase
          .from('transactions_clean')
          .update({ initial_net_capital: result.calculatedNC })
          .eq('transaction_id', result.transactionId);
      }
    }
    
    // Reload validation
    validateDeal(selectedDeal);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PASS: 'bg-green-100 text-green-800',
      WARN: 'bg-yellow-100 text-yellow-800',
      FAIL: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Formula Validation Dashboard</h1>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Transactions</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="text-sm text-green-600">Passed</div>
          <div className="text-2xl font-bold text-green-700">{stats.passed}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <div className="text-sm text-yellow-600">Warnings</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.warned}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <div className="text-sm text-red-600">Failed</div>
          <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          className="px-4 py-2 border rounded-lg"
          value={selectedDeal || ''}
          onChange={(e) => setSelectedDeal(Number(e.target.value))}
        >
          <option value="">Select a deal</option>
          {deals.map(deal => (
            <option key={deal.deal_id} value={deal.deal_id}>
              {deal.deal_name} ({deal.formula_template})
            </option>
          ))}
        </select>

        <button
          onClick={() => selectedDeal && validateDeal(selectedDeal)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Validating...' : 'Refresh Validation'}
        </button>

        {stats.failed > 0 && (
          <button
            onClick={recalculateAll}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            disabled={loading}
          >
            Fix Failed Calculations
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Transaction
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Formula
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Gross Capital
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Stored NC
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Calculated NC
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Difference
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Formula Inputs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {validationResults.map((result) => (
              <tr key={result.transactionId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  #{result.transactionId}
                </td>
                <td className="px-4 py-3 text-sm">
                  {result.formulaTemplate}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono">
                  ${result.grossCapital.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono">
                  ${result.storedNC.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono">
                  ${result.calculatedNC.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={result.status === 'PASS' ? 'text-gray-500' : 'text-red-600'}>
                    {result.percentDiff.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(result.status)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {result.pmsp && `PMSP: ${result.pmsp}`}
                  {result.isp && ` ISP: ${result.isp}`}
                  {result.sfr && ` SFR: ${result.sfr}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {loading && (
          <div className="p-8 text-center text-gray-500">
            Loading validation results...
          </div>
        )}
        
        {!loading && validationResults.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Select a deal to validate transactions
          </div>
        )}
      </div>
    </div>
  );
}