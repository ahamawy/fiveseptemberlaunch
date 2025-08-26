"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
} from "@/lib/theme-utils";
import { LineChart } from "@/components/ui/Charts";
import { resolveInvestorId } from "@/lib/utils/investor";
import { ArrowLeftIcon, BuildingOfficeIcon, DocumentTextIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface DealDetail {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
    sector: string | null;
    logo_url?: string;
  };
  type: string;
  stage: string;
  currency: string;
  target_raise: number | null;
  minimum_investment: number | null;
  opening_date: string | null;
  closing_date: string | null;
  description?: string;
  investment_summary?: {
    committed: number;
    called: number;
    distributed: number;
    current_value: number;
    irr: number;
    moic: number;
  };
  transactions?: Array<{
    id: number;
    date: string;
    type: string;
    amount: number;
    description: string;
  }>;
  documents?: Array<{
    id: number;
    name: string;
    type: string;
    uploaded_date: string;
    size: string;
  }>;
  historical_valuations?: Array<{
    date: string;
    moic: number;
    irr: number | null;
    nav: number;
  }>;
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "documents">("overview");

  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const investorParam = searchParams?.get("investor") || null;
  const investorId = resolveInvestorId(investorParam);

  useEffect(() => {
    fetchDealDetails();
  }, [dealId, investorId]);

  const fetchDealDetails = async () => {
    try {
      // Fetch deal details
      const dealResponse = await fetch(`/api/deals/${dealId}`);
      if (!dealResponse.ok) throw new Error("Failed to load deal");
      const dealData = await dealResponse.json();

      // Fetch investor-specific data if we have an investor ID
      let investmentSummary = null;
      let transactions = null;
      let documents = null;

      if (investorId) {
        // Get investor's investment in this deal
        const portfolioResponse = await fetch(`/api/investors/${investorId}/portfolio`);
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          const dealInvestment = portfolioData.deals?.find((d: any) => d.dealId === parseInt(dealId));
          if (dealInvestment) {
            investmentSummary = {
              committed: dealInvestment.committed,
              called: dealInvestment.called,
              distributed: dealInvestment.distributed,
              current_value: dealInvestment.currentValue,
              irr: dealInvestment.irr,
              moic: dealInvestment.moic,
            };
          }
        }

        // Get transactions for this deal
        const txResponse = await fetch(`/api/transactions?deal_id=${dealId}&investor_id=${investorId}`);
        if (txResponse.ok) {
          const txData = await txResponse.json();
          transactions = txData.data?.map((tx: any) => ({
            id: tx.id,
            date: tx.transaction_date,
            type: tx.transaction_type || "Investment",
            amount: tx.initial_net_capital || tx.gross_capital || 0,
            description: tx.description || `Transaction for ${dealData.name}`,
          }));
        }

        // Get documents for this deal
        const docsResponse = await fetch(`/api/documents?deal_id=${dealId}&investor_id=${investorId}`);
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          documents = docsData.data?.map((doc: any) => ({
            id: doc.id,
            name: doc.document_name,
            type: doc.document_type,
            uploaded_date: doc.upload_date,
            size: doc.file_size || "N/A",
          }));
        }
      }

      // Mock historical valuations for now (should come from deal_valuations table)
      const historical_valuations = generateHistoricalValuations(
        investmentSummary?.current_value || dealData.target_raise || 1000000,
        investmentSummary?.moic || dealData.valuation?.moic || 1.0
      );

      setDeal({
        id: dealData.id,
        name: dealData.name,
        company: {
          id: dealData.company_id,
          name: dealData.company_name || "Unknown Company",
          sector: dealData.company_sector,
          logo_url: dealData.company_logo_url,
        },
        type: dealData.type || "direct",
        stage: dealData.stage || "active",
        currency: dealData.currency || "USD",
        target_raise: dealData.target_raise,
        minimum_investment: dealData.minimum_investment,
        opening_date: dealData.opening_date,
        closing_date: dealData.closing_date,
        description: dealData.description,
        investment_summary: investmentSummary || undefined,
        transactions,
        documents,
        historical_valuations,
      });
    } catch (error) {
      console.error("Error fetching deal details:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalValuations = (currentValue: number, currentMoic: number) => {
    const months = 12;
    const data = [];
    const baseValue = currentValue / currentMoic;

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - i - 1));
      const progress = i / (months - 1);
      const moic = 1.0 + (currentMoic - 1.0) * progress;
      const nav = baseValue * moic;
      const irr = 10 + progress * 15;

      data.push({
        date: date.toISOString().split("T")[0],
        moic: Math.round(moic * 100) / 100,
        irr: Math.round(irr * 10) / 10,
        nav: Math.round(nav),
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
          <div className="text-muted-foreground">Loading deal details...</div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-error-400">Deal not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />

        <div className="relative z-10 p-6 lg:p-8 space-y-8">
          {/* Header with back button */}
          <div className="pb-6 border-b border-border">
            <Button
              onClick={() => router.back()}
              variant="glass"
              size="sm"
              className="mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
                  {deal.name}
                </h1>
                <div className="mt-2 flex items-center space-x-4 text-muted-foreground">
                  <span className="flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                    {deal.company.name}
                  </span>
                  {deal.company.sector && (
                    <span className="px-2 py-1 rounded-full bg-muted text-xs">
                      {deal.company.sector}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Deal Type</div>
                <div className="text-lg font-semibold text-foreground capitalize">
                  {deal.type.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>

          {/* Investment Summary (if investor-specific) */}
          {deal.investment_summary && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
              <Card variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Committed
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-foreground">
                    {formatCurrency(deal.investment_summary.committed, deal.currency)}
                  </dd>
                </CardContent>
              </Card>
              <Card variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Called
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-foreground">
                    {formatCurrency(deal.investment_summary.called, deal.currency)}
                  </dd>
                </CardContent>
              </Card>
              <Card variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Distributed
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-foreground">
                    {formatCurrency(deal.investment_summary.distributed, deal.currency)}
                  </dd>
                </CardContent>
              </Card>
              <Card variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Current Value
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-foreground">
                    {formatCurrency(deal.investment_summary.current_value, deal.currency)}
                  </dd>
                </CardContent>
              </Card>
              <Card variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <dt className="text-sm font-medium text-muted-foreground">
                    IRR
                  </dt>
                  <dd className={`mt-2 text-2xl font-bold ${getStatusColor(deal.investment_summary.irr).text}`}>
                    {formatPercentage(deal.investment_summary.irr)}
                  </dd>
                </CardContent>
              </Card>
              <Card variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <dt className="text-sm font-medium text-muted-foreground">
                    MOIC
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-foreground">
                    {deal.investment_summary.moic.toFixed(2)}x
                  </dd>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Valuation Chart */}
          {deal.historical_valuations && deal.historical_valuations.length > 0 && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle gradient>
                  <ChartBarIcon className="w-5 h-5 inline mr-2" />
                  Performance Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChart
                    labels={deal.historical_valuations.map(v => v.date)}
                    datasets={[
                      {
                        label: "MOIC",
                        data: deal.historical_valuations.map(v => v.moic),
                      }
                    ]}
                    height={240}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for different sections */}
          <div>
            <div className="flex space-x-2 mb-6">
              <Button
                onClick={() => setActiveTab("overview")}
                variant={activeTab === "overview" ? "primary" : "glass"}
              >
                Overview
              </Button>
              {deal.transactions && (
                <Button
                  onClick={() => setActiveTab("transactions")}
                  variant={activeTab === "transactions" ? "primary" : "glass"}
                >
                  Transactions ({deal.transactions.length})
                </Button>
              )}
              {deal.documents && (
                <Button
                  onClick={() => setActiveTab("documents")}
                  variant={activeTab === "documents" ? "primary" : "glass"}
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Documents ({deal.documents.length})
                </Button>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle gradient>Deal Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Target Raise</h3>
                      <p className="text-lg text-foreground">
                        {deal.target_raise ? formatCurrency(deal.target_raise, deal.currency) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Minimum Investment</h3>
                      <p className="text-lg text-foreground">
                        {deal.minimum_investment ? formatCurrency(deal.minimum_investment, deal.currency) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Opening Date</h3>
                      <p className="text-lg text-foreground">
                        {deal.opening_date ? new Date(deal.opening_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Closing Date</h3>
                      <p className="text-lg text-foreground">
                        {deal.closing_date ? new Date(deal.closing_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                      <p className="text-lg text-foreground capitalize">{deal.stage}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Currency</h3>
                      <p className="text-lg text-foreground">{deal.currency}</p>
                    </div>
                  </div>
                  {deal.description && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                      <p className="text-foreground">{deal.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "transactions" && deal.transactions && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle gradient>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {deal.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-muted transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {tx.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatCurrency(tx.amount, deal.currency)}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {tx.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "documents" && deal.documents && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle gradient>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deal.documents.map((doc) => (
                      <Card key={doc.id} variant="gradient" className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent>
                          <DocumentTextIcon className="w-8 h-8 text-primary-300 mb-2" />
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.type} • {doc.size}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            Uploaded {new Date(doc.uploaded_date).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}