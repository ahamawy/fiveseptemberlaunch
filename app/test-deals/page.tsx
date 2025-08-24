"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { KPICard, KPIGrid } from "@/components/ui/KPICard";
import {
  ChartBarIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Deal {
  id: number;
  name: string;
  company: string;
  stage: string;
  targetRaise: number;
  currentRaise: number;
  minimumInvestment: number;
  targetClose: string;
  status: string;
  irr?: number;
  moic?: number;
  sector?: string;
  description?: string;
}

export default function TestDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<"mock" | "api">("mock");

  const mockDeals: Deal[] = [
    {
      id: 1,
      name: "Series B - TechCo",
      company: "TechCo Inc.",
      stage: "Series B",
      targetRaise: 50000000,
      currentRaise: 35000000,
      minimumInvestment: 100000,
      targetClose: "2024-03-31",
      status: "active",
      irr: 25,
      moic: 3.2,
      sector: "Technology",
      description: "Leading SaaS platform for enterprise automation",
    },
    {
      id: 2,
      name: "Growth Round - HealthTech",
      company: "HealthTech Solutions",
      stage: "Growth",
      targetRaise: 75000000,
      currentRaise: 60000000,
      minimumInvestment: 250000,
      targetClose: "2024-04-15",
      status: "active",
      irr: 22,
      moic: 2.8,
      sector: "Healthcare",
      description: "AI-powered diagnostic tools for hospitals",
    },
    {
      id: 3,
      name: "Series A - FinTech",
      company: "PaymentsPro",
      stage: "Series A",
      targetRaise: 20000000,
      currentRaise: 18000000,
      minimumInvestment: 50000,
      targetClose: "2024-02-28",
      status: "closing",
      irr: 30,
      moic: 4.1,
      sector: "Financial Services",
      description: "Next-gen payment processing infrastructure",
    },
    {
      id: 4,
      name: "Seed - CleanTech",
      company: "GreenEnergy Co",
      stage: "Seed",
      targetRaise: 5000000,
      currentRaise: 2000000,
      minimumInvestment: 25000,
      targetClose: "2024-05-31",
      status: "active",
      irr: 35,
      moic: 5.0,
      sector: "Clean Technology",
      description: "Revolutionary solar panel efficiency technology",
    },
    {
      id: 5,
      name: "Series C - BioTech",
      company: "GenomicsLab",
      stage: "Series C",
      targetRaise: 100000000,
      currentRaise: 100000000,
      minimumInvestment: 500000,
      targetClose: "2024-01-31",
      status: "closed",
      irr: 20,
      moic: 2.5,
      sector: "Biotechnology",
      description: "Gene therapy treatments for rare diseases",
    },
  ];

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);

    try {
      if (testMode === "mock") {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeals(mockDeals);
      } else {
        const response = await fetch("/api/deals");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setDeals(data.data || data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deals");
      if (testMode === "api") {
        // Fallback to mock data if API fails
        setDeals(mockDeals);
        setError(`${error} - Showing mock data instead`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode]);

  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.status === "active").length;
  const totalRaised = deals.reduce((sum, d) => sum + d.currentRaise, 0);
  const avgProgress = deals.reduce((sum, d) => sum + (d.currentRaise / d.targetRaise * 100), 0) / deals.length || 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "default"> = {
      active: "success",
      closing: "warning",
      closed: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatProgress = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-background-deep p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Test Deals Page</h1>
        <p className="text-text-secondary">Development page for testing deal functionality</p>
      </div>

      {/* Controls */}
      <Card variant="glass" className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm text-text-secondary">Data Source:</label>
              <div className="flex gap-2">
                <Button
                  variant={testMode === "mock" ? "primary" : "glass"}
                  size="sm"
                  onClick={() => setTestMode("mock")}
                >
                  Mock Data
                </Button>
                <Button
                  variant={testMode === "api" ? "primary" : "glass"}
                  size="sm"
                  onClick={() => setTestMode("api")}
                >
                  API Data
                </Button>
              </div>
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={fetchDeals}
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {error && (
            <div className="mt-3 p-2 bg-error-500/20 rounded text-error-400 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <KPIGrid className="mb-8">
        <KPICard
          title="Total Deals"
          value={totalDeals}
          subtitle="In pipeline"
          icon={<ChartBarIcon className="w-5 h-5" />}
          variant="gradient"
        />
        <KPICard
          title="Active Deals"
          value={activeDeals}
          subtitle="Currently raising"
          icon={<CheckCircleIcon className="w-5 h-5" />}
          variant="elevated"
          change={activeDeals > 3 ? 5 : -2}
        />
        <KPICard
          title="Total Raised"
          value={formatCurrency(totalRaised)}
          subtitle="Across all deals"
          icon={<BanknotesIcon className="w-5 h-5" />}
          variant="glass"
        />
        <KPICard
          title="Avg Progress"
          value={`${avgProgress.toFixed(0)}%`}
          subtitle="To target"
          icon={<ChartBarIcon className="w-5 h-5" />}
          variant="gradient"
          glow
        />
      </KPIGrid>

      {/* Deals Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Deal Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No deals found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Deal</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Company</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Stage</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Progress</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Min Investment</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Target Close</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Metrics</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-medium">{deal.name}</div>
                          <div className="text-xs text-text-tertiary mt-1">{deal.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-text-tertiary" />
                          <span className="text-white">{deal.company}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="default">{deal.stage}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white text-sm">
                            {formatCurrency(deal.currentRaise)} / {formatCurrency(deal.targetRaise)}
                          </div>
                          <div className="mt-1 w-32 h-2 bg-surface-base rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-300 transition-all"
                              style={{ width: formatProgress(deal.currentRaise, deal.targetRaise) }}
                            />
                          </div>
                          <div className="text-xs text-text-tertiary mt-1">
                            {formatProgress(deal.currentRaise, deal.targetRaise)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">
                        {formatCurrency(deal.minimumInvestment)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-text-tertiary" />
                          <span className="text-white text-sm">{deal.targetClose}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(deal.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {deal.irr && <div className="text-white">IRR: {deal.irr}%</div>}
                          {deal.moic && <div className="text-text-secondary">MOIC: {deal.moic}x</div>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Status */}
      <Card variant="glass" className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {loading ? (
              <XCircleIcon className="w-5 h-5 text-warning-400" />
            ) : error ? (
              <XCircleIcon className="w-5 h-5 text-error-400" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-success-400" />
            )}
            <span className="text-sm text-text-secondary">
              Test Status: {loading ? "Loading..." : error ? "Error (using fallback)" : "Success"}
            </span>
            <span className="text-xs text-text-tertiary ml-auto">
              Mode: {testMode} | Count: {deals.length} deals
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}