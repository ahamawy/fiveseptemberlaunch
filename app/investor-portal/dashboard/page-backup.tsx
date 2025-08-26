'use client';

import { useEffect, useState } from 'react';
import PortfolioCard from './components/PortfolioCard';
import PerformanceChart from './components/PerformanceChart';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';

interface DashboardData {
  portfolio: {
    totalValue: number;
    totalCommitted: number;
    totalDistributed: number;
    unrealizedGain: number;
  };
  performance: {
    irr: number;
    moic: number;
    dpi: number;
    tvpi: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    amount?: number;
    date: string;
  }>;
  activeDeals: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/investors/1/dashboard');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`);
      }
      
      const dashboardData = await response.json();
      
      // Validate the response has expected shape
      if (!dashboardData.portfolio || !dashboardData.performance) {
        throw new Error('Invalid dashboard data structure');
      }
      
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
          <div className="text-text-secondary">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-error-400 text-xl">Failed to load dashboard</div>
          <div className="text-text-secondary">{error || 'No data available'}</div>
          <button 
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="relative">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
        
        <div className="relative z-10 p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-surface-border">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
              Welcome back, Investor
            </h1>
            <p className="mt-2 text-text-secondary">
              Here's your portfolio overview for today
            </p>
          </div>

          {/* Portfolio cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <PortfolioCard
              title="Total Portfolio Value"
              value={data.portfolio.totalValue}
              change={12.5}
              currency="USD"
            />
            <PortfolioCard
              title="Total Committed"
              value={data.portfolio.totalCommitted}
              currency="USD"
            />
            <PortfolioCard
              title="Total Distributed"
              value={data.portfolio.totalDistributed}
              currency="USD"
            />
            <PortfolioCard
              title="Unrealized Gain"
              value={data.portfolio.unrealizedGain}
              change={8.3}
              currency="USD"
            />
          </div>

          {/* Charts and Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PerformanceChart 
                irr={data.performance.irr}
                moic={data.performance.moic}
                dpi={data.performance.dpi}
                tvpi={data.performance.tvpi}
              />
            </div>
            <div>
              <QuickActions activeDeals={data.activeDeals} />
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}