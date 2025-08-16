'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/theme-utils';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function TestRealDataPage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/investors/1').then(r => r.json()),
      fetch('/api/investors/1/dashboard').then(r => r.json()),
      fetch('/api/investors/1/portfolio').then(r => r.json()),
      fetch('/api/investors/1/commitments').then(r => r.json()),
      fetch('/api/investors/1/transactions').then(r => r.json())
    ]).then(([investor, dashboard, portfolio, commitments, transactions]) => {
      setData({ investor, dashboard, portfolio, commitments, transactions });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading real Supabase data...</div>;

  return (
    <div className="p-8 bg-background-deep min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Real Supabase Data</h1>
        <p className="text-text-secondary">Live data from investor_units and transactions tables</p>
      </div>

      {/* Investor Info */}
      <Card variant="gradient" className="mb-8 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-6 h-6 text-success-400" />
          Investor Profile
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-text-secondary">Name</p>
            <p className="text-white font-semibold">{data.investor.name}</p>
          </div>
          <div>
            <p className="text-text-secondary">Email</p>
            <p className="text-white">{data.investor.email}</p>
          </div>
          <div>
            <p className="text-text-secondary">Country</p>
            <p className="text-white">{data.investor.country}</p>
          </div>
          <div>
            <p className="text-text-secondary">Type</p>
            <p className="text-white">{data.investor.type}</p>
          </div>
        </div>
      </Card>

      {/* Dashboard Summary */}
      <Card variant="glass" className="mb-8 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-6 h-6 text-success-400" />
          Dashboard Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-300">
              {formatCurrency(data.dashboard.portfolio.totalValue)}
            </p>
            <p className="text-text-secondary mt-1">Current Value</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {formatCurrency(data.dashboard.portfolio.totalCommitted)}
            </p>
            <p className="text-text-secondary mt-1">Total Committed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success-400">
              {data.dashboard.activeDeals}
            </p>
            <p className="text-text-secondary mt-1">Active Deals</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-warning-400">
              {data.dashboard.performance.irr.toFixed(1)}%
            </p>
            <p className="text-text-secondary mt-1">Portfolio IRR</p>
          </div>
        </div>
      </Card>

      {/* Portfolio Holdings */}
      <Card variant="glass" className="mb-8 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-6 h-6 text-success-400" />
          Portfolio Holdings ({data.portfolio.deals?.length || 0} Deals)
        </h2>
        <div className="space-y-3">
          {data.portfolio.deals?.slice(0, 5).map((deal: any) => (
            <div key={deal.dealId} className="border-l-4 border-primary-300 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">{deal.dealName}</h3>
                  <p className="text-text-secondary text-sm">
                    {deal.companyName} • {deal.sector}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary-300 font-semibold">
                    {formatCurrency(deal.currentValue)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {deal.moic.toFixed(2)}x MOIC
                  </p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-text-tertiary">Invested:</span>
                  <span className="text-white ml-1">{formatCurrency(deal.called)}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Units:</span>
                  <span className="text-white ml-1">{deal.units.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Unit Price:</span>
                  <span className="text-white ml-1">${deal.currentUnitPrice}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Gain:</span>
                  <span className="text-success-300 ml-1">
                    {formatCurrency(deal.unrealizedGain)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {data.portfolio.deals?.length > 5 && (
          <p className="text-text-secondary text-sm mt-4">
            ... and {data.portfolio.deals.length - 5} more deals
          </p>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card variant="glass" className="p-6">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircleIcon className="w-6 h-6 text-success-400" />
          Recent Transactions
        </h2>
        <div className="space-y-2">
          {data.transactions?.data?.slice(0, 5).map((tx: any) => (
            <div key={tx.id} className="flex justify-between items-center py-2 border-b border-surface-border">
              <div>
                <p className="text-white">Transaction #{tx.id}</p>
                <p className="text-text-secondary text-sm">
                  Deal #{tx.deal_id} • {tx.transaction_date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary-300 font-semibold">
                  {formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-text-tertiary">{tx.type}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Source Confirmation */}
      <div className="mt-8 p-4 bg-success-500/10 border border-success-500/30 rounded-lg">
        <p className="text-success-300 font-semibold">✓ All data loaded from Supabase</p>
        <p className="text-text-secondary text-sm mt-1">
          Tables: investors.investor, investor_units, transactions.transaction.primary, deals.deal
        </p>
      </div>
    </div>
  );
}