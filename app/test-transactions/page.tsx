'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/theme-utils';

export default function TestTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        console.log('Transactions data:', data);
        if (data.success && data.data) {
          setTransactions(data.data);
        } else if (data.transactions) {
          // Handle the wrapped format
          setTransactions(data.transactions);
        } else {
          setError('No transactions data');
        }
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading transactions from Supabase...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 bg-background-deep min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Test Transactions from Supabase</h1>
      
      <div className="mb-4 text-text-secondary">
        Found {transactions.length} transactions in database
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left p-2 text-text-secondary">ID</th>
              <th className="text-left p-2 text-text-secondary">Date</th>
              <th className="text-left p-2 text-text-secondary">Type</th>
              <th className="text-left p-2 text-text-secondary">Amount</th>
              <th className="text-left p-2 text-text-secondary">Investor</th>
              <th className="text-left p-2 text-text-secondary">Deal</th>
              <th className="text-left p-2 text-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/50">
                <td className="p-2 text-white">{tx.id}</td>
                <td className="p-2 text-white">{tx.transaction_date}</td>
                <td className="p-2 text-white">{tx.type}</td>
                <td className="p-2 text-primary-300">{formatCurrency(tx.amount)}</td>
                <td className="p-2 text-white">Investor #{tx.investor_id}</td>
                <td className="p-2 text-white">Deal #{tx.deal_id}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.status === 'completed' ? 'bg-success-500/20 text-success-300' :
                    tx.status === 'pending' ? 'bg-warning-500/20 text-warning-300' :
                    'bg-surface-elevated text-text-secondary'
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <Card variant="glass" className="mt-8 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">First Transaction Raw Data</h3>
          <pre className="text-xs text-text-tertiary overflow-auto">
            {JSON.stringify(transactions[0], null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}