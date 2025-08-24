'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/theme-utils';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface Deal {
  id: string;
  name: string;
  status: string;
  company_name?: string;
  total_funding?: number;
  closing_date?: string;
  created_at: string;
}

export default function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch('/api/deals-list?limit=20');
        const result = await response.json();
        
        if (result.success) {
          setDeals(result.data || []);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load deals');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-300"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-primary-500/20 text-primary-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Deals</h2>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          + New Deal
        </button>
      </div>

      <div className="bg-background-surface rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Company</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Total Funding</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Closing Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary"></th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr 
                  key={deal.id} 
                  className="border-b border-surface-border hover:bg-surface-hover transition-colors"
                  data-testid="deals-item"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{deal.name}</div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {deal.company_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-primary">
                    {deal.total_funding ? formatCurrency(deal.total_funding) : '-'}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {deal.closing_date ? new Date(deal.closing_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary-400 hover:text-primary-300">
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deals.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            No deals found. Create your first deal to get started.
          </div>
        )}
      </div>
    </div>
  );
}