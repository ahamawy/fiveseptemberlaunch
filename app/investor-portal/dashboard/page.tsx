"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";
import { resolveInvestorId as resolveId } from "@/lib/utils/investor";

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

  const searchParams = useSearchParams();
  const investorParam = searchParams.get("investor");
  const resolveInvestorId = () => resolveId(investorParam);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorParam]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const investorId = resolveInvestorId();
      const response = await fetch(`/api/investors/${investorId}/dashboard`);

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`);
      }

      const dashboardData = await response.json();

      // Validate the response has expected shape
      if (!dashboardData.portfolio || !dashboardData.performance) {
        throw new Error("Invalid dashboard data structure");
      }

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard"
      );
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
          <div className="text-text-secondary">
            {error || "No data available"}
          </div>
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
    <div className="min-h-screen bg-background-deep p-6 lg:p-8">
      {/* Header */}
      <div className="pb-6 border-b border-surface-border mb-8">
        <h1 className="text-4xl font-bold text-white">
          Welcome back, Investor
        </h1>
        <p className="mt-2 text-text-secondary">
          Here's your portfolio overview for today
        </p>
      </div>

      {/* Portfolio cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card variant="gradient" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-sm text-text-secondary mb-2">Total Portfolio Value</h3>
            <p className="text-2xl font-bold text-text-primary">
              ${data.portfolio.totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-sm text-text-secondary mb-2">Total Committed</h3>
            <p className="text-2xl font-bold text-text-primary">
              ${data.portfolio.totalCommitted.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-sm text-text-secondary mb-2">Total Distributed</h3>
            <p className="text-2xl font-bold text-text-primary">
              ${data.portfolio.totalDistributed.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-sm text-text-secondary mb-2">Unrealized Gain</h3>
            <p className="text-2xl font-bold text-text-primary">
              ${data.portfolio.unrealizedGain.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-surface-elevated rounded-xl p-6 border border-surface-border">
          <h2 className="text-xl font-semibold text-white mb-4">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-text-secondary">IRR</p>
              <p className="text-xl font-bold text-white">
                {data.performance.irr}%
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">MOIC</p>
              <p className="text-xl font-bold text-white">
                {data.performance.moic}x
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">DPI</p>
              <p className="text-xl font-bold text-white">
                {data.performance.dpi}x
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">TVPI</p>
              <p className="text-xl font-bold text-white">
                {data.performance.tvpi}x
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-xl p-6 border border-surface-border">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/investor-portal/deals"
              className="block p-3 bg-primary-300/20 rounded-lg hover:bg-primary-300/30 transition-colors"
            >
              <p className="text-white font-medium">View Active Deals</p>
              <p className="text-sm text-text-secondary">
                {data.activeDeals} deals available
              </p>
            </a>
            <a
              href="/investor-portal/documents"
              className="block p-3 bg-surface-base rounded-lg hover:bg-surface-hover transition-colors"
            >
              <p className="text-white font-medium">Documents</p>
              <p className="text-sm text-text-secondary">
                Access your documents
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-elevated rounded-xl p-6 border border-surface-border">
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {data.recentActivity.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="flex justify-between items-start pb-4 border-b border-surface-border last:border-0"
            >
              <div>
                <p className="text-white font-medium">{activity.description}</p>
                <p className="text-sm text-text-secondary mt-1">
                  {activity.type.replace("_", " ").toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <p className="text-white font-medium">
                    ${activity.amount.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-text-secondary mt-1">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
