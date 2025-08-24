"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";
import { resolveInvestorId as resolveId } from "@/lib/utils/investor";
import { Button, ButtonGroup } from "@/components/ui/Button";
import { MotionSection } from "@/components/ui/Motion";
import { LineChart } from "@/components/ui/Charts";
import { KPICard, KPIGrid, HeroKPICard } from "@/components/ui/KPICard";
import {
  InformationCircleIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  BanknotesIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

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

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<"percent" | "currency">(
    "percent"
  );
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [scenario, setScenario] = useState<"down" | "base" | "up">("base");

  const searchParams = useSearchParams();
  const investorParam = searchParams.get("investor");
  const resolveInvestorId = () => resolveId(investorParam);

  useEffect(() => {
    // load persisted privacy prefs
    if (typeof window !== "undefined") {
      const gm = localStorage.getItem("guest-mode");
      if (gm === "true") setGuestMode(true);
      const dm = localStorage.getItem("dashboard-display-mode");
      if (dm === "currency" || dm === "percent") setDisplayMode(dm);
    }
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

      const responseData = await response.json();

      // Handle standardized API response format
      const dashboardData = responseData.data || responseData;

      // Validate the response has expected shape
      if (!dashboardData.portfolio || !dashboardData.performance) {
        throw new Error("Invalid dashboard data structure");
      }

      setData(dashboardData);
    } catch (error) {
      // Error is handled by setting error state
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // Privacy helpers
  const maskIfHidden = (value: string) => {
    if (guestMode && !isHolding && displayMode === "currency") return "•••";
    return value;
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n || 0);

  const percentSinceEntry = useMemo(() => {
    if (!data) return 0;
    const invested = data.portfolio.totalCommitted || 0;
    const current = data.portfolio.totalValue || 0;
    if (invested <= 0) return 0;
    return (current / invested - 1) * 100;
  }, [data]);

  const top2ConcentrationPct = useMemo(() => {
    // Placeholder: without per-deal breakdown on dashboard, use heuristic from portfolio if available later
    return 0; // hidden if zero
  }, []);

  const adjustedUnrealized = useMemo(() => {
    if (!data) return 0;
    const base = data.portfolio.unrealizedGain || 0;
    if (scenario === "down") return base * 0.7;
    if (scenario === "up") return base * 1.3;
    return base;
  }, [data, scenario]);

  const investedAmount = data?.portfolio.totalCommitted || 0;
  const realizedPL = data?.portfolio.totalDistributed || 0; // may be negative when outflows
  const currentValue = data?.portfolio.totalValue || 0;
  const baseUnrealized = data?.portfolio.unrealizedGain || 0;

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
    <div className="relative min-h-screen bg-background p-6 lg:p-8">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10 pointer-events-none" />
      <div className="relative z-10">
      {/* Top bar: Lead + Guest Mode */}
      <div className="flex items-start justify-between pb-6 border-b border-surface-border mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-text-secondary">
            Your capital is working quietly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={guestMode ? "primary" : "glass"}
            size="sm"
            onClick={() => {
              const next = !guestMode;
              setGuestMode(next);
              if (typeof window !== "undefined")
                localStorage.setItem("guest-mode", String(next));
            }}
            title="Guest Mode hides amounts across the app"
          >
            <EyeSlashIcon className="w-4 h-4 mr-2" /> Guest Mode
          </Button>
        </div>
      </div>

      {/* Hero KPI - Total Portfolio Value */}
      <MotionSection>
        <div data-testid="kpi-total-portfolio-value">
          <HeroKPICard
            title="Total Portfolio Value"
            value={maskIfHidden(formatCurrency(currentValue))}
            subtitle={`${data.activeDeals} active positions across multiple sectors`}
            trend={{
              value: Math.round(percentSinceEntry),
              label: "since entry",
            }}
            className="mb-6"
          />
        </div>
      </MotionSection>

      {/* First 7 seconds: greeting, percent-only overview, hold-to-reveal */}
      <MotionSection>
        <Card variant="glass" className="mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-text-secondary">
                <div className="text-sm">
                  {`+${Math.round(percentSinceEntry)}% since entry`} ·{" "}
                  {data.activeDeals} positions
                  {top2ConcentrationPct > 0
                    ? ` · Top-2 = ${Math.round(top2ConcentrationPct)}% of value`
                    : ""}
                </div>
                <div className="text-xs mt-1">
                  Touch & hold to reveal amounts
                </div>
              </div>
              <div
                className="flex items-center gap-3 select-none"
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
              >
                <ButtonGroup>
                  <Button
                    variant={displayMode === "percent" ? "primary" : "glass"}
                    size="sm"
                    onClick={() => {
                      setDisplayMode("percent");
                      if (typeof window !== "undefined")
                        localStorage.setItem(
                          "dashboard-display-mode",
                          "percent"
                        );
                    }}
                  >
                    %
                  </Button>
                  <Button
                    variant={displayMode === "currency" ? "primary" : "glass"}
                    size="sm"
                    onClick={() => {
                      setDisplayMode("currency");
                      if (typeof window !== "undefined")
                        localStorage.setItem(
                          "dashboard-display-mode",
                          "currency"
                        );
                    }}
                  >
                    $
                  </Button>
                </ButtonGroup>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 ml-2">
                  <div>
                    <p className="text-xs text-text-tertiary">Current value</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {displayMode === "percent"
                        ? "100%"
                        : maskIfHidden(formatCurrency(currentValue))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Invested</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {displayMode === "percent"
                        ? `${Math.round(
                            (investedAmount / (currentValue || 1)) * 100
                          )}%`
                        : maskIfHidden(formatCurrency(investedAmount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Gain</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {displayMode === "percent"
                        ? `${Math.round(
                            ((currentValue - investedAmount) /
                              (investedAmount || 1)) *
                              100
                          )}%`
                        : maskIfHidden(
                            formatCurrency(currentValue - investedAmount)
                          )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">MOIC</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {(data.performance.moic || 1).toFixed(1)}×
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-text-tertiary mt-3">
              Estimates; updated as new information arrives.
            </p>
          </CardContent>
        </Card>
      </MotionSection>

      {/* Above-the-fold: What matters + Waterfall chip + Thin area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              What matters now
              <InformationCircleIcon
                className="w-4 h-4 text-text-tertiary"
                title="Plain-language highlights for your portfolio."
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Two potential liquidity windows in the next 6–12 months.</div>
            <div>Two marks older than 12 months — pushing for updates.</div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Quiet visuals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Waterfall chip */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-text-secondary">
                  $50k → Current Value (scenario)
                </div>
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant={scenario === "down" ? "primary" : "glass"}
                    onClick={() => setScenario("down")}
                  >
                    −30%
                  </Button>
                  <Button
                    size="sm"
                    variant={scenario === "base" ? "primary" : "glass"}
                    onClick={() => setScenario("base")}
                  >
                    Base
                  </Button>
                  <Button
                    size="sm"
                    variant={scenario === "up" ? "primary" : "glass"}
                    onClick={() => setScenario("up")}
                  >
                    +30%
                  </Button>
                </ButtonGroup>
              </div>
              {(() => {
                const total = Math.max(
                  1,
                  investedAmount +
                    Math.max(0, realizedPL) +
                    Math.max(0, adjustedUnrealized)
                );
                const investedPct = Math.min(
                  100,
                  Math.max(0, (investedAmount / total) * 100)
                );
                const realizedPct = Math.min(
                  100,
                  Math.max(0, (Math.max(0, realizedPL) / total) * 100)
                );
                const unrealPct = Math.min(
                  100,
                  Math.max(0, (Math.max(0, adjustedUnrealized) / total) * 100)
                );
                return (
                  <div className="w-full h-3 rounded-full bg-surface-base border border-surface-border overflow-hidden">
                    <div
                      className="h-full bg-primary-300"
                      style={{ width: `${investedPct}%` }}
                    />
                    <div
                      className="h-full bg-success-500"
                      style={{ width: `${realizedPct}%` }}
                    />
                    <div
                      className="h-full bg-info-500"
                      style={{ width: `${unrealPct}%` }}
                    />
                  </div>
                );
              })()}
              <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-300" />{" "}
                  Invested
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success-500" />{" "}
                  Realized P/L
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-info-500" />{" "}
                  Unrealized P/L
                </span>
              </div>
            </div>

            {/* Thin wealth-over-time area (hide if unavailable) */}
            <div className="h-40">
              {/* If we have a series in future, render here; otherwise keep space minimal */}
              <div className="w-full h-full rounded-lg border border-surface-border flex items-center justify-center text-text-tertiary text-sm">
                Wealth over time
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance metrics with rich KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div
          className="lg:col-span-2"
          data-testid="section-performance-metrics"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Performance Metrics
          </h2>
          <KPIGrid>
            <KPICard
              title="IRR"
              value={`${Math.round(data.performance.irr)}%`}
              subtitle="Internal Rate of Return"
              icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
              variant="gradient"
              glow
              change={data.performance.irr > 15 ? 5 : -2}
            />
            <KPICard
              title="MOIC"
              value={`${data.performance.moic}x`}
              subtitle="Multiple on Invested Capital"
              icon={<ChartBarIcon className="w-5 h-5" />}
              variant="glass"
              animate
            />
            <KPICard
              title="DPI"
              value={`${data.performance.dpi}x`}
              subtitle="Distributions to Paid-In"
              icon={<BanknotesIcon className="w-5 h-5" />}
              variant="elevated"
              change={data.performance.dpi > 0.5 ? 8 : 0}
              changeType={data.performance.dpi > 0.5 ? "increase" : "neutral"}
            />
            <KPICard
              title="TVPI"
              value={`${data.performance.tvpi}x`}
              subtitle="Total Value to Paid-In"
              icon={<ChartPieIcon className="w-5 h-5" />}
              variant="gradient"
              glow
            />
          </KPIGrid>
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
      <div
        className="bg-surface-elevated rounded-xl p-6 border border-surface-border"
        data-testid="section-recent-activity"
      >
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-text-secondary">
          Loading...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
