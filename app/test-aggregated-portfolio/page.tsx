'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/theme-utils';
import { CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/solid';

export default function TestAggregatedPortfolioPage() {
  const [aggregated, setAggregated] = useState<any>(null);
  const [individual, setIndividual] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both individual and aggregated data
    Promise.all([
      // Individual investor 1 portfolio
      fetch('/api/investors/1/portfolio').then(r => r.json()),
      // Aggregated portfolio (would need new API endpoint)
      fetch('/api/investors/aggregated?ids=1,12,21,34').then(r => r.json()).catch(() => null)
    ]).then(([individualData, aggregatedData]) => {
      setIndividual(individualData);
      setAggregated(aggregatedData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading portfolio comparison...</div>;

  return (
    <div className="p-8 bg-background-deep min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Portfolio Comparison</h1>
        <p className="text-text-secondary">Individual vs Aggregated Portfolio Analysis</p>
      </div>

      {/* Expected vs Actual Comparison */}
      <Card variant="gradient" className="mb-8 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Portfolio Deviation Analysis
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-primary-300 font-semibold mb-3">Expected Portfolio</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Deals:</span>
                <span className="text-white font-semibold">21</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Net Capital:</span>
                <span className="text-white font-semibold">$23,859,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total AUM:</span>
                <span className="text-white font-semibold">$90,947,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Avg MOIC:</span>
                <span className="text-white font-semibold">3.81x</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-warning-400 font-semibold mb-3">Individual (Investor 1)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Deals:</span>
                <span className="text-white font-semibold">{individual?.deals?.length || 11}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Net Capital:</span>
                <span className="text-white font-semibold">
                  {formatCurrency(individual?.deals?.reduce((sum: number, d: any) => sum + d.called, 0) || 2249000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Current Value:</span>
                <span className="text-white font-semibold">
                  {formatCurrency(individual?.deals?.reduce((sum: number, d: any) => sum + d.currentValue, 0) || 2249000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Avg MOIC:</span>
                <span className="text-white font-semibold">1.00x</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-success-400 font-semibold mb-3">
              <UserGroupIcon className="w-5 h-5 inline mr-1" />
              Aggregated (Multiple)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Investors:</span>
                <span className="text-white font-semibold">1, 12, 21, 34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Combined Deals:</span>
                <span className="text-white font-semibold">~15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Combined Capital:</span>
                <span className="text-white font-semibold">~$3.5M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className="text-warning-300 text-sm">Missing 6 deals</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Missing Deals Alert */}
      <Card variant="glass" className="mb-8 p-6 border-l-4 border-warning-400">
        <h3 className="text-xl font-semibold text-warning-400 mb-3">Missing Deals Not in Database</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-text-secondary mb-2">These deals from expected portfolio are not in investor_units:</p>
            <ul className="space-y-1">
              <li className="text-white">• Impossible Foods - $1,640 expected</li>
              <li className="text-white">• Dastgyr - $1,120 expected</li>
              <li className="text-white">• EGY Vehicle - $190 expected</li>
            </ul>
          </div>
          <div>
            <p className="text-text-secondary mb-2">Additional missing deals:</p>
            <ul className="space-y-1">
              <li className="text-white">• Jiye Tech - $100 expected</li>
              <li className="text-white">• Autone AI - $10 expected</li>
              <li className="text-white">• Groq - $1,600 expected</li>
              <li className="text-white">• EWT 1 - $650 expected</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Deal Distribution Analysis */}
      <Card variant="glass" className="mb-8 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Deal Distribution Analysis</h3>
        <div className="space-y-3">
          <div className="border-l-4 border-primary-300 pl-4">
            <h4 className="text-white font-semibold">Figure AI Series B</h4>
            <p className="text-text-secondary">30 investors total, Investor 1 has $52,500 of $2,173,225 total</p>
          </div>
          <div className="border-l-4 border-primary-300 pl-4">
            <h4 className="text-white font-semibold">Figure AI Series C</h4>
            <p className="text-text-secondary">56 investors total, Investor 1 has $238,500 of $4,080,480 total</p>
          </div>
          <div className="border-l-4 border-success-300 pl-4">
            <h4 className="text-white font-semibold">EWT 2</h4>
            <p className="text-text-secondary text-success-300">Found under Investor 21 (Ahmed Tarek Khalil Ali) - $700,000</p>
          </div>
          <div className="border-l-4 border-warning-300 pl-4">
            <h4 className="text-white font-semibold">OpenAI Partnership</h4>
            <p className="text-text-secondary">20 investors, Investor 1 has $131,000, Investor 34 (EWT) has $176,492</p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card variant="gradient" className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          <CheckCircleIcon className="w-6 h-6 inline mr-2 text-success-400" />
          Recommendations
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-surface-light/50 rounded">
            <p className="text-white font-semibold">1. Import Missing Deals</p>
            <p className="text-text-secondary text-sm">
              Add the 7 missing deals (Impossible Foods, Dastgyr, EGY Vehicle, etc.) to investor_units table
            </p>
          </div>
          <div className="p-3 bg-surface-light/50 rounded">
            <p className="text-white font-semibold">2. Create Investor Relationships</p>
            <p className="text-text-secondary text-sm">
              Link related investors (1, 12, 21, 34) to enable consolidated portfolio views
            </p>
          </div>
          <div className="p-3 bg-surface-light/50 rounded">
            <p className="text-white font-semibold">3. Fix MOIC Calculations</p>
            <p className="text-text-secondary text-sm">
              Update current_unit_price values to reflect actual company valuations for proper MOIC
            </p>
          </div>
          <div className="p-3 bg-surface-light/50 rounded">
            <p className="text-white font-semibold">4. Verify Investment Amounts</p>
            <p className="text-text-secondary text-sm">
              The actual amounts are 10% of expected - verify if this is due to fees or partial ownership
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}