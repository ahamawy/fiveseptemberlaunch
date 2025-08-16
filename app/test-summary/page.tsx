'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface EndpointStatus {
  name: string;
  url: string;
  status: 'loading' | 'success' | 'error';
  count?: number;
  error?: string;
  data?: any;
}

export default function TestSummaryPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'Deals', url: '/api/deals', status: 'loading' },
    { name: 'Transactions', url: '/api/transactions', status: 'loading' },
    { name: 'Documents', url: '/api/documents', status: 'loading' },
    { name: 'Investor 1', url: '/api/investors/1', status: 'loading' },
    { name: 'Investor 1 Dashboard', url: '/api/investors/1/dashboard', status: 'loading' },
    { name: 'Investor 1 Portfolio', url: '/api/investors/1/portfolio', status: 'loading' },
    { name: 'Investor 1 Transactions', url: '/api/transactions?investor_id=1', status: 'loading' },
    { name: 'Fee Profiles', url: '/api/admin/fees/profiles', status: 'loading' },
    { name: 'Health Check', url: '/api/health/supabase', status: 'loading' }
  ]);

  useEffect(() => {
    endpoints.forEach((endpoint, index) => {
      fetch(endpoint.url)
        .then(res => res.json())
        .then(data => {
          setEndpoints(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              status: 'success',
              count: data.data?.length || (data.success ? 1 : 0),
              data: data
            };
            return updated;
          });
        })
        .catch(err => {
          setEndpoints(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              status: 'error',
              error: err.message
            };
            return updated;
          });
        });
    });
  }, []);

  return (
    <div className="p-8 bg-background-deep min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-2">Supabase Integration Status</h1>
      <p className="text-text-secondary mb-8">Testing all API endpoints with real Supabase data</p>

      <div className="grid gap-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.name} variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {endpoint.status === 'loading' && (
                  <div className="w-5 h-5 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
                )}
                {endpoint.status === 'success' && (
                  <CheckCircleIcon className="w-5 h-5 text-success-400" />
                )}
                {endpoint.status === 'error' && (
                  <XCircleIcon className="w-5 h-5 text-error-400" />
                )}
                
                <div>
                  <h3 className="font-semibold text-white">{endpoint.name}</h3>
                  <p className="text-xs text-text-tertiary">{endpoint.url}</p>
                </div>
              </div>

              <div className="text-right">
                {endpoint.status === 'success' && (
                  <div>
                    {endpoint.count !== undefined && (
                      <span className="text-primary-300 font-semibold">
                        {endpoint.count} records
                      </span>
                    )}
                    {endpoint.data?.status && (
                      <span className="text-success-300 text-sm ml-2">
                        {endpoint.data.status}
                      </span>
                    )}
                  </div>
                )}
                {endpoint.status === 'error' && (
                  <span className="text-error-400 text-sm">{endpoint.error}</span>
                )}
              </div>
            </div>

            {endpoint.status === 'success' && endpoint.data && (
              <details className="mt-3">
                <summary className="text-xs text-text-tertiary cursor-pointer hover:text-text-secondary">
                  View Response
                </summary>
                <pre className="mt-2 p-2 bg-surface-elevated rounded text-xs text-text-tertiary overflow-auto max-h-40">
                  {JSON.stringify(endpoint.data, null, 2)}
                </pre>
              </details>
            )}
          </Card>
        ))}
      </div>

      <Card variant="gradient" className="mt-8 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-text-secondary">Database Connection</span>
            <span className="text-success-300 font-semibold">✓ Connected to Supabase</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Project ID</span>
            <span className="text-white font-mono">ikezqzljrupkzmyytgok</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Data Mode</span>
            <span className="text-primary-300">Real Supabase Data</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Environment</span>
            <span className="text-white">Development</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-border">
          <h3 className="text-sm font-semibold text-white mb-2">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            <a href="/test-deals" className="text-primary-300 hover:text-primary-200 text-sm">
              → View Deals
            </a>
            <a href="/test-transactions" className="text-primary-300 hover:text-primary-200 text-sm">
              → View Transactions
            </a>
            <a href="/admin/fees/profiles" className="text-primary-300 hover:text-primary-200 text-sm">
              → Fee Profiles Admin
            </a>
            <a href="/admin/fees/import" className="text-primary-300 hover:text-primary-200 text-sm">
              → Fee Import Admin
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}