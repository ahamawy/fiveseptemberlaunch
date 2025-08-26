'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/theme-utils';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { DealSummary } from '@/lib/types/domain';

export default function DealsList() {
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/deals-list?limit=20');
        const json = await res.json();
        if (json.success) {
          setDeals(json.data || []);
        } else {
          setError(json.error || 'Failed to load deals');
        }
      } catch {
        setError('Failed to load deals');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div data-testid="deals-loading" className="min-h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading deals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="deals-error" className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  const getStatusColor = (stage?: string | null) => {
    switch ((stage || '').toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      case 'exited': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-primary-500/20 text-primary-400';
    }
  };

  return (
    <div className="space-y-6" data-testid="deals-list">
      <div className="flex justify-between items-center">
        <h2 data-testid="deals-title" className="text-2xl font-bold text-foreground">
          Deals
        </h2>
        <button 
          data-testid="new-deal-button"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          + New Deal
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-base border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Company</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Target Raise</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Closing Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {deals.map((deal) => (
                <tr 
                  key={deal.id} 
                  data-testid="deals-item"
                  className="hover:bg-muted transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{deal.name}</div>
                    <div className="text-sm text-muted-foreground">{deal.type || 'Investment'}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {deal.company_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.stage)}`}>
                      {deal.stage || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {deal.target_raise ? formatCurrency(deal.target_raise, deal.currency || 'USD') : '-'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {deal.closing_date ? new Date(deal.closing_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-primary-400 hover:text-primary-300 transition-colors"
                      aria-label={`View ${deal.name} details`}
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deals.length === 0 && (
          <div data-testid="deals-empty" className="text-center py-12 text-muted-foreground">
            No deals found. Create your first deal to get started.
          </div>
        )}
      </div>
    </div>
  );
}