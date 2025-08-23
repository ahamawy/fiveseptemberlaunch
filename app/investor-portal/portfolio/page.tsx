"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
} from "@/lib/theme-utils";
import { BarChart } from "@/components/ui/BarChart";
import { NivoPie } from "@/components/ui/NivoCharts";
import { MotionSection } from "@/components/ui/Motion";
import { resolveInvestorId as resolveId } from "@/lib/utils/investor";

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
  historicalPerformance?: Array<{
    date: string;
    nav: number;
    irr: number;
    moic: number;
  }>;
}

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"table" | "cards">("table");
  const [filterSector, setFilterSector] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const investorParam = searchParams?.get("investor") || null;
  const resolveInvestorId = () => resolveId(investorParam);

  useEffect(() => {
    fetchPortfolioData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorParam]);

  const fetchPortfolioData = async () => {
    try {
      const investorId = resolveInvestorId();
      const response = await fetch(`/api/investors/${investorId}/portfolio`);
      if (!response.ok) throw new Error("Failed to load portfolio");
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

  const sectors = [
    "all",
    ...Array.from(
      new Set(data.allocation.bySector.map((s) => s.sector || "unknown"))
    ),
  ];
  const types = [
    "all",
    ...Array.from(
      new Set(
        data.allocation.byType.map((t) => t.type.replace("_", " ") || "unknown")
      )
    ),
  ];

  const visibleDeals = data.deals.filter((d) => {
    const sectorOk = filterSector === "all" || d.sector === filterSector;
    const typeLabel =
      d.dealType === "fund" ? "partnership" : d.dealType.replace("_", " ");
    const typeOk = filterType === "all" || typeLabel === filterType;
    return sectorOk && typeOk;
  });

  const averageMoic = visibleDeals.length
    ? visibleDeals.reduce((sum, d) => sum + Number(d.moic || 0), 0) /
      visibleDeals.length
    : 1;

  const exportCsv = () => {
    const header = [
      "dealId,dealName,companyName,dealType,currency,committed,currentValue,irr,moic,status,sector",
    ];
    const rows = visibleDeals.map((d) =>
      [
        d.dealId,
        JSON.stringify(d.dealName),
        JSON.stringify(d.companyName),
        d.dealType,
        d.currency,
        d.committed,
        d.currentValue,
        d.irr,
        d.moic,
        d.status,
        JSON.stringify(d.sector || ""),
      ].join(",")
    );
    const csv = [...header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio_deals.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <MotionSection>
            <div className="pb-6 border-b border-surface-border">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
                Portfolio Overview
              </h1>
              <p className="mt-2 text-text-secondary">
                Detailed view of your investment portfolio
              </p>
            </div>
          </MotionSection>

          {/* Summary Cards */}
          <MotionSection delay={0.05}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card
                variant="gradient"
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-5">
                  <dt className="text-sm font-medium text-text-secondary">
                    Total Portfolio Value
                  </dt>
                  <dd className="mt-3 text-3xl font-extrabold text-text-primary tracking-tight">
                    {formatCurrency(data.summary.totalValue)}
                  </dd>
                </CardContent>
              </Card>
              <Card
                variant="glass"
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-5">
                  <dt className="text-sm font-medium text-text-secondary">
                    Total Deals
                  </dt>
                  <dd className="mt-3 text-3xl font-bold text-text-primary">
                    {data.summary.totalDeals}
                  </dd>
                </CardContent>
              </Card>
              <Card
                variant="glass"
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-5">
                  <dt className="text-sm font-medium text-text-secondary">
                    Active Deals
                  </dt>
                  <dd className="mt-3 text-3xl font-extrabold text-success-400">
                    {data.summary.activeDeals}
                  </dd>
                </CardContent>
              </Card>
              <Card
                variant="glass"
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-5">
                  <dt className="text-sm font-medium text-text-secondary">
                    Exited Deals
                  </dt>
                  <dd className="mt-3 text-3xl font-extrabold text-info-400">
                    {data.summary.exitedDeals}
                  </dd>
                </CardContent>
              </Card>
            </div>
          </MotionSection>

          {/* NAV Trend */}
          {data.historicalPerformance &&
            data.historicalPerformance.length > 0 && (
              <MotionSection delay={0.1}>
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle gradient>NAV Over Last 12 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {/* Lazy import to avoid SSR issues not necessary since page is client */}
                      {(() => {
                        const { LineChart } = require("@/components/ui/Charts");
                        const labels = data.historicalPerformance!.map(
                          (p) => p.date
                        );
                        const values = data.historicalPerformance!.map((p) =>
                          Math.round(p.nav)
                        );
                        return (
                          <LineChart
                            labels={labels}
                            datasets={[
                              { label: "NAV", data: values, fill: true },
                            ]}
                            height={240}
                          />
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </MotionSection>
            )}

          {/* Allocation Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card variant="glass">
              <CardHeader>
                <CardTitle gradient>Allocation by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">
                        Sector
                      </span>
                      <div className="flex gap-1 p-1 bg-surface-elevated rounded-lg border border-surface-border">
                        {sectors.map((s) => (
                          <button
                            key={s}
                            onClick={() => setFilterSector(s)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                              filterSector === s
                                ? "bg-primary-300 text-white"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">Type</span>
                      <div className="flex gap-1 p-1 bg-surface-elevated rounded-lg border border-surface-border">
                        {types.map((t) => (
                          <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                              filterType === t
                                ? "bg-primary-300 text-white"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        setFilterSector("all");
                        setFilterType("all");
                      }}
                    >
                      Reset
                    </Button>
                    <Button variant="primary" size="sm" onClick={exportCsv}>
                      Export CSV
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <BarChart
                      labels={data.allocation.bySector.map((s) => s.sector)}
                      values={data.allocation.bySector.map((s) =>
                        Math.round(s.value)
                      )}
                      maxBars={10}
                    />
                  </div>
                  <div>
                    <NivoPie
                      data={data.allocation.bySector.map((s) => ({
                        id: s.sector || "unknown",
                        value: Math.round(s.value),
                      }))}
                      height={240}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle gradient>Allocation by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  labels={data.allocation.byType.map((t) =>
                    t.type.replace("_", " ")
                  )}
                  values={data.allocation.byType.map((t) =>
                    Math.round(t.value)
                  )}
                  maxBars={6}
                />
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
                      {visibleDeals.map((deal) => (
                        <tr
                          key={deal.dealId}
                          className="hover:bg-surface-hover transition-colors cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/investor-portal/deals/${
                              deal.dealId
                            }?investor=${resolveInvestorId()}`)
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                            <a
                              href={`/investor-portal/deals/${deal.dealId}?investor=${resolveInvestorId()}`}
                              className="hover:text-primary-300 transition-colors inline-flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {"companyLogoUrl" in deal && deal.companyLogoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={(deal as any).companyLogoUrl} alt="logo" className="w-5 h-5 rounded object-cover border border-surface-border" />
                              ) : (
                                <span className="w-5 h-5 rounded bg-surface-elevated border border-surface-border inline-block" />
                              )}
                              {deal.dealName}
                            </a>
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
                  {visibleDeals.map((deal) => (
                    <Card
                      key={deal.dealId}
                      variant="gradient"
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/investor-portal/deals/${
                          deal.dealId
                        }?investor=${resolveInvestorId()}`)
                      }
                    >
                      <CardContent>
                        <div className="mb-3 flex items-center gap-2">
                          {"companyLogoUrl" in deal && deal.companyLogoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={(deal as any).companyLogoUrl} alt="logo" className="w-6 h-6 rounded object-cover border border-surface-border" />
                          ) : (
                            <span className="w-6 h-6 rounded bg-surface-elevated border border-surface-border inline-block" />
                          )}
                          <h4 className="text-sm font-semibold text-text-primary hover:text-primary-300 transition-colors">
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
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                              deal.status
                            )}`}
                          >
                            {deal.status}
                          </span>
                          <ChevronRightIcon className="w-4 h-4 text-text-tertiary" />
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
