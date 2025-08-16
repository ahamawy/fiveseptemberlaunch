'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/theme-utils';

export default function TestDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => {
        console.log('Deals data:', data);
        if (data.success && data.data) {
          setDeals(data.data);
        } else {
          setError('No deals data');
        }
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading deals from Supabase...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 bg-background-deep min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Test Deals from Supabase</h1>
      
      <div className="mb-4 text-text-secondary">
        Found {deals.length} deals in database
      </div>

      <div className="grid gap-4">
        {deals.map((deal) => (
          <Card key={deal.id} variant="glass" className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{deal.name}</h2>
                <p className="text-text-secondary">ID: {deal.id} | Type: {deal.type}</p>
              </div>
              <div className="text-right">
                <div className="text-primary-300 font-semibold">
                  {formatCurrency(deal.target_raise)}
                </div>
                <div className="text-sm text-text-secondary">{deal.currency}</div>
              </div>
            </div>
            
            {deal.company && (
              <div className="border-t border-surface-border pt-4">
                <p className="text-sm text-text-secondary">Company</p>
                <p className="text-white">{deal.company.name}</p>
                <p className="text-xs text-text-tertiary">{deal.company.industry}</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <p className="text-text-secondary">Stage</p>
                <p className="text-white">{deal.stage}</p>
              </div>
              <div>
                <p className="text-text-secondary">Opening Date</p>
                <p className="text-white">{deal.opening_date || 'N/A'}</p>
              </div>
              <div>
                <p className="text-text-secondary">Current Raise</p>
                <p className="text-white">{formatCurrency(deal.current_raise)}</p>
              </div>
            </div>

            <div className="mt-4 p-2 bg-surface-elevated rounded text-xs text-text-tertiary">
              <details>
                <summary className="cursor-pointer">Raw Data</summary>
                <pre className="mt-2 overflow-auto">{JSON.stringify(deal, null, 2)}</pre>
              </details>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}