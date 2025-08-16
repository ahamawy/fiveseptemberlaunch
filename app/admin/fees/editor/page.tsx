"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/theme-utils';
import { 
  PencilIcon,
  CalculatorIcon,
  CheckCircleIcon, 
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Deal {
  id: number;
  name: string;
  total_capital: number;
  investor_count: number;
}

interface FeeComponent {
  id?: number;
  component: string;
  basis: 'capital' | 'gains' | 'fixed';
  percent?: number;
  amount?: number;
  applied: boolean;
}

interface InvestorFee {
  investor_id: number;
  investor_name: string;
  net_capital: number;
  fees: FeeComponent[];
  total_fees: number;
  net_transfer: number;
}

export default function DealFeeEditorPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [investorFees, setInvestorFees] = useState<InvestorFee[]>([]);
  const [feeTemplate, setFeeTemplate] = useState<FeeComponent[]>([
    { component: 'management_fee', basis: 'capital', percent: 2.0, amount: 0, applied: false },
    { component: 'admin_fee', basis: 'capital', percent: 0.5, amount: 0, applied: false },
    { component: 'performance_fee', basis: 'gains', percent: 20.0, amount: 0, applied: false },
    { component: 'structuring_fee', basis: 'capital', percent: 1.0, amount: 0, applied: false },
    { component: 'premium', basis: 'capital', percent: 4.0, amount: 0, applied: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    fetchDeals();
  }, []);
  
  useEffect(() => {
    if (selectedDeal) {
      fetchDealDetails(selectedDeal);
    }
  }, [selectedDeal]);
  
  const fetchDeals = async () => {
    try {
      // Fetch deals with investor counts
      const res = await fetch('/api/admin/fees/deals');
      const data = await res.json();
      if (data.deals) {
        setDeals(data.deals);
      }
    } catch (e) {
      console.error('Failed to fetch deals:', e);
    }
  };
  
  const fetchDealDetails = async (dealId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fees/deals/${dealId}`);
      const data = await res.json();
      
      if (data.investors) {
        // Calculate fees for each investor
        const investorsWithFees = data.investors.map((inv: any) => {
          const fees = feeTemplate.map(template => ({
            ...template,
            amount: template.basis === 'capital' 
              ? (inv.net_capital * (template.percent || 0) / 100)
              : 0
          }));
          
          const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
          
          return {
            investor_id: inv.investor_id,
            investor_name: inv.investor_name || `Investor ${inv.investor_id}`,
            net_capital: inv.net_capital,
            fees,
            total_fees: totalFees,
            net_transfer: inv.net_capital - totalFees
          };
        });
        
        setInvestorFees(investorsWithFees);
      }
    } catch (e) {
      console.error('Failed to fetch deal details:', e);
    } finally {
      setLoading(false);
    }
  };
  
  const updateFeeComponent = (index: number, field: string, value: any) => {
    const newTemplate = [...feeTemplate];
    newTemplate[index] = { ...newTemplate[index], [field]: value };
    setFeeTemplate(newTemplate);
    
    // Recalculate investor fees
    if (selectedDeal) {
      fetchDealDetails(selectedDeal);
    }
  };
  
  const addFeeComponent = () => {
    setFeeTemplate([
      ...feeTemplate,
      { component: 'custom_fee', basis: 'capital', percent: 0, amount: 0, applied: false }
    ]);
  };
  
  const removeFeeComponent = (index: number) => {
    setFeeTemplate(feeTemplate.filter((_, i) => i !== index));
  };
  
  const applyFeesToDeal = async () => {
    if (!selectedDeal) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fees/deals/${selectedDeal}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_template: feeTemplate,
          investor_fees: investorFees
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully applied fees to ${data.applied_count} investors`);
        
        // Mark fees as applied
        setFeeTemplate(feeTemplate.map(f => ({ ...f, applied: true })));
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Failed to apply fees: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const copyTemplate = () => {
    const templateText = JSON.stringify(feeTemplate, null, 2);
    navigator.clipboard.writeText(templateText);
    setMessage('Template copied to clipboard');
  };
  
  return (
    <div className="min-h-screen bg-background-deep">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Deal-by-Deal Fee Editor
          </h1>
          <p className="text-sm text-gray-400">
            Configure and apply fees to individual deals and investors
          </p>
        </div>
        
        {/* Deal Selector */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Select Deal</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {deals.map(deal => (
              <button
                key={deal.id}
                onClick={() => setSelectedDeal(deal.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedDeal === deal.id
                    ? 'bg-primary-300/20 border-primary-300 text-white'
                    : 'bg-surface border-surface-border text-gray-300 hover:bg-surface-light'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{deal.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {deal.investor_count} investors
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatCurrency(deal.total_capital)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        
        {/* Fee Template Editor */}
        {selectedDeal && (
          <Card variant="glass" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5" />
                Fee Template
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyTemplate}
                  className="px-3 py-1 rounded text-sm bg-surface border border-surface-border text-white hover:bg-surface-light"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 inline mr-1" />
                  Copy Template
                </button>
                <button
                  onClick={addFeeComponent}
                  className="px-3 py-1 rounded text-sm bg-primary-300/20 border border-primary-300 text-primary-300 hover:bg-primary-300/30"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Component
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {feeTemplate.map((fee, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-surface-light/30 rounded">
                  <input
                    type="text"
                    value={fee.component}
                    onChange={(e) => updateFeeComponent(index, 'component', e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-surface border border-surface-border text-white text-sm"
                    placeholder="Component name"
                  />
                  
                  <select
                    value={fee.basis}
                    onChange={(e) => updateFeeComponent(index, 'basis', e.target.value)}
                    className="px-2 py-1 rounded bg-surface border border-surface-border text-white text-sm"
                  >
                    <option value="capital">Capital</option>
                    <option value="gains">Gains</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  
                  {fee.basis !== 'fixed' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={fee.percent || 0}
                        onChange={(e) => updateFeeComponent(index, 'percent', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-surface border border-surface-border text-white text-sm"
                        step="0.1"
                      />
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                  )}
                  
                  {fee.basis === 'fixed' && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={fee.amount || 0}
                        onChange={(e) => updateFeeComponent(index, 'amount', parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 rounded bg-surface border border-surface-border text-white text-sm"
                      />
                    </div>
                  )}
                  
                  {fee.applied && (
                    <CheckCircleIcon className="w-4 h-4 text-success-300" />
                  )}
                  
                  <button
                    onClick={() => removeFeeComponent(index)}
                    className="p-1 rounded hover:bg-error-500/20 text-error-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Investor Fees Preview */}
        {selectedDeal && investorFees.length > 0 && (
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              Investor Fees Preview
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-400">Investor</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Capital</th>
                    {feeTemplate.map(fee => (
                      <th key={fee.component} className="text-right py-2 px-3 text-sm font-medium text-gray-400">
                        {fee.component.replace(/_/g, ' ')}
                      </th>
                    ))}
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Total Fees</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Net Transfer</th>
                  </tr>
                </thead>
                <tbody>
                  {investorFees.slice(0, 10).map(inv => (
                    <tr key={inv.investor_id} className="border-b border-surface-border hover:bg-surface-light/30">
                      <td className="py-2 px-3 text-sm text-white">{inv.investor_name}</td>
                      <td className="py-2 px-3 text-sm text-right text-white">
                        {formatCurrency(inv.net_capital)}
                      </td>
                      {inv.fees.map((fee, idx) => (
                        <td key={idx} className="py-2 px-3 text-sm text-right text-gray-300">
                          {formatCurrency(fee.amount || 0)}
                        </td>
                      ))}
                      <td className="py-2 px-3 text-sm text-right text-warning-300">
                        {formatCurrency(inv.total_fees)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right font-medium text-success-300">
                        {formatCurrency(inv.net_transfer)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-surface-border">
                  <tr>
                    <td className="py-3 px-3 text-sm font-medium text-white">Total</td>
                    <td className="py-3 px-3 text-sm text-right font-medium text-white">
                      {formatCurrency(investorFees.reduce((sum, inv) => sum + inv.net_capital, 0))}
                    </td>
                    {feeTemplate.map((_, idx) => (
                      <td key={idx} className="py-3 px-3 text-sm text-right font-medium text-gray-300">
                        {formatCurrency(investorFees.reduce((sum, inv) => sum + (inv.fees[idx]?.amount || 0), 0))}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-sm text-right font-medium text-warning-300">
                      {formatCurrency(investorFees.reduce((sum, inv) => sum + inv.total_fees, 0))}
                    </td>
                    <td className="py-3 px-3 text-sm text-right font-bold text-success-300">
                      {formatCurrency(investorFees.reduce((sum, inv) => sum + inv.net_transfer, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <button
              onClick={applyFeesToDeal}
              disabled={loading}
              className="mt-4 px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-success-500 to-success-600 text-white hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircleIcon className="w-5 h-5 inline mr-2" />
              Apply Fees to Database
            </button>
          </Card>
        )}
        
        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.includes('Success') || message.includes('success')
              ? 'bg-success-500/20 border border-success-500/30 text-success-300'
              : message.includes('Error') || message.includes('error')
              ? 'bg-error-500/20 border border-error-500/30 text-error-300'
              : 'bg-primary-300/20 border border-primary-300/30 text-primary-300'
          }`}>
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}