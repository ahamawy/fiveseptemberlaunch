"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
} from "@/lib/theme-utils";

interface DealPerformance {
  dealId: number;
  dealName: string;
  companyName: string;
  sector: string;
  dealType: string;
  committed: number;
  called: number;
  distributed: number;
  currentValue: number;
  irr: number;
  moic: number;
  status: "active" | "exited" | "written_off";
  currency: string;
  stage: string;
}

interface PortfolioData {
  deals: DealPerformance[];
  allocation: {
    bySector: Array<{
      sector: string;
      value: number;
      percentage: number;
      dealCount: number;
    }>;
    byType: Array<{
      type: string;
      value: number;
      percentage: number;
      dealCount: number;
    }>;
  };
  summary: {
    totalDeals: number;
    activeDeals: number;
    exitedDeals: number;
    totalValue: number;
  };
}

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"table" | "cards">("table");

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch("/api/investors/1/portfolio");
      const portfolioData = await response.json();
      setData(portfolioData);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-deep flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
          <div className="text-text-secondary">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background-deep flex items-center justify-center">
        <div className="text-error-400">Error loading portfolio data</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-success-500/20 text-success-400 border-success-400/30",
      exited: "bg-info-500/20 text-info-400 border-info-400/30",
      written_off: "bg-error-500/20 text-error-400 border-error-400/30",
    };
    return (
      styles[status as keyof typeof styles] ||
      "bg-neutral-500/20 text-neutral-400 border-neutral-400/30"
    );
  };

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />

        <div className="relative z-10 p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-surface-border">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
              Portfolio Overview
            </h1>
            <p className="mt-2 text-text-secondary">
              Detailed view of your investment portfolio
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card variant="glass" className="hover:shadow-lg transition-shadow">
              <CardContent>
                <dt className="text-sm font-medium text-text-secondary">
                  Total Portfolio Value
                </dt>
                <dd className="mt-3 text-3xl font-bold text-text-primary">
                  {formatCurrency(data.summary.totalValue)}
                </dd>
              </CardContent>
            </Card>
            <Card variant="glass" className="hover:shadow-lg transition-shadow">
              <CardContent>
                <dt className="text-sm font-medium text-text-secondary">
                  Total Deals
                </dt>
                <dd className="mt-3 text-3xl font-bold text-text-primary">
                  {data.summary.totalDeals}
                </dd>
              </CardContent>
            </Card>
            <Card variant="glass" className="hover:shadow-lg transition-shadow">
              <CardContent>
                <dt className="text-sm font-medium text-text-secondary">
                  Active Deals
                </dt>
                <dd className="mt-3 text-3xl font-bold text-success-400">
                  {data.summary.activeDeals}
                </dd>
              </CardContent>
            </Card>
            <Card variant="glass" className="hover:shadow-lg transition-shadow">
              <CardContent>
                <dt className="text-sm font-medium text-text-secondary">
                  Exited Deals
                </dt>
                <dd className="mt-3 text-3xl font-bold text-info-400">
                  {data.summary.exitedDeals}
                </dd>
              </CardContent>
            </Card>
          </div>

          {/* Allocation Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card variant="glass">
              <CardHeader>
                <CardTitle gradient>Allocation by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.allocation.bySector.map((sector) => (
                    <div key={sector.sector}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">
                          {sector.sector}
                        </span>
                        <span className="font-medium text-text-primary">
                          {formatPercentage(sector.percentage)}
                        </span>
                      </div>
                      <div className="bg-surface-hover rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-primary-300 to-accent-blue transition-all duration-500"
                          style={{ width: `${sector.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle gradient>Allocation by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.allocation.byType.map((type) => (
                    <div key={type.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary capitalize">
                          {type.type.replace("_", " ")}
                        </span>
                        <span className="font-medium text-text-primary">
                          {formatPercentage(type.percentage)}
                        </span>
                      </div>
                      <div className="bg-surface-hover rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-accent-green to-accent-teal transition-all duration-500"
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deals Table/Cards */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle gradient>Deals</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedView("table")}
                    variant={selectedView === "table" ? "primary" : "glass"}
                    size="sm"
                  >
                    Table
                  </Button>
                  <Button
                    onClick={() => setSelectedView("cards")}
                    variant={selectedView === "cards" ? "primary" : "glass"}
                    size="sm"
                  >
                    Cards
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedView === "table" ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-surface-border">
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Deal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Committed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          IRR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          MOIC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {data.deals.map((deal) => (
                        <tr
                          key={deal.dealId}
                          className="hover:bg-surface-hover transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                            {deal.dealName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {deal.companyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">
                            {deal.dealType === "fund"
                              ? "Partnership"
                              : deal.dealType.replace("_", " ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            {formatCurrency(deal.committed, deal.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            {formatCurrency(deal.currentValue, deal.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={getStatusColor(deal.irr).text}>
                              {formatPercentage(deal.irr)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            {deal.moic.toFixed(2)}x
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                                deal.status
                              )}`}
                            >
                              {deal.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.deals.map((deal) => (
                    <Card
                      key={deal.dealId}
                      variant="gradient"
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent>
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-text-primary">
                            {deal.dealName}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            {deal.companyName}
                            <span className="ml-2 px-2 py-0.5 rounded-full border border-white/10 text-[10px] uppercase tracking-wide text-white/70">
                              {deal.dealType === "fund"
                                ? "Partnership"
                                : deal.dealType}
                            </span>
                          </p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-tertiary">
                              Committed:
                            </span>
                            <span className="font-medium text-text-primary">
                              {formatCurrency(deal.committed, deal.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-tertiary">
                              Current Value:
                            </span>
                            <span className="font-medium text-text-primary">
                              {formatCurrency(deal.currentValue, deal.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-tertiary">IRR:</span>
                            <span
                              className={`font-medium ${
                                getStatusColor(deal.irr).text
                              }`}
                            >
                              {formatPercentage(deal.irr)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-tertiary">MOIC:</span>
                            <span className="font-medium text-text-primary">
                              {deal.moic.toFixed(2)}x
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                              deal.status
                            )}`}
                          >
                            {deal.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
