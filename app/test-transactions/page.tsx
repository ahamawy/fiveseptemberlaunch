// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { KPICard, KPIGrid } from "@/components/ui/KPICard";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Transaction {
  id: string;
  type: "investment" | "distribution" | "fee" | "capital_call";
  dealName: string;
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending" | "processing";
  investor?: string;
  description?: string;
  reference?: string;
}

export default function TestTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<"mock" | "api">("mock");
  const [filter, setFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const mockTransactions: Transaction[] = [
    {
      id: "TXN-001",
      type: "investment",
      dealName: "Series B - TechCo",
      amount: 500000,
      currency: "USD",
      date: "2024-01-15",
      status: "completed",
      investor: "John Smith",
      description: "Initial investment commitment",
      reference: "INV-2024-001",
    },
    {
      id: "TXN-002",
      type: "capital_call",
      dealName: "Series B - TechCo",
      amount: 125000,
      currency: "USD",
      date: "2024-01-20",
      status: "completed",
      investor: "John Smith",
      description: "First capital call (25%)",
      reference: "CALL-2024-001",
    },
    {
      id: "TXN-003",
      type: "fee",
      dealName: "Series B - TechCo",
      amount: 5000,
      currency: "USD",
      date: "2024-01-21",
      status: "completed",
      investor: "John Smith",
      description: "Management fee Q1 2024",
      reference: "FEE-2024-001",
    },
    {
      id: "TXN-004",
      type: "distribution",
      dealName: "Series A - FinTech",
      amount: 75000,
      currency: "USD",
      date: "2024-02-01",
      status: "completed",
      investor: "John Smith",
      description: "Partial exit distribution",
      reference: "DIST-2024-001",
    },
    {
      id: "TXN-005",
      type: "investment",
      dealName: "Growth Round - HealthTech",
      amount: 250000,
      currency: "USD",
      date: "2024-02-15",
      status: "processing",
      investor: "John Smith",
      description: "New investment commitment",
      reference: "INV-2024-002",
    },
    {
      id: "TXN-006",
      type: "capital_call",
      dealName: "Growth Round - HealthTech",
      amount: 62500,
      currency: "USD",
      date: "2024-02-20",
      status: "pending",
      investor: "John Smith",
      description: "Initial capital call (25%)",
      reference: "CALL-2024-002",
    },
    {
      id: "TXN-007",
      type: "fee",
      dealName: "Growth Round - HealthTech",
      amount: 2500,
      currency: "USD",
      date: "2024-02-21",
      status: "pending",
      investor: "John Smith",
      description: "Structuring fee",
      reference: "FEE-2024-002",
    },
    {
      id: "TXN-008",
      type: "distribution",
      dealName: "Seed - CleanTech",
      amount: 150000,
      currency: "USD",
      date: "2024-03-01",
      status: "completed",
      investor: "John Smith",
      description: "Full exit distribution",
      reference: "DIST-2024-002",
    },
    {
      id: "TXN-009",
      type: "investment",
      dealName: "Series C - BioTech",
      amount: 1000000,
      currency: "USD",
      date: "2024-03-15",
      status: "completed",
      investor: "John Smith",
      description: "Large investment commitment",
      reference: "INV-2024-003",
    },
    {
      id: "TXN-010",
      type: "capital_call",
      dealName: "Series C - BioTech",
      amount: 333333,
      currency: "USD",
      date: "2024-03-20",
      status: "completed",
      investor: "John Smith",
      description: "First tranche (33.3%)",
      reference: "CALL-2024-003",
    },
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      if (testMode === "mock") {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTransactions(mockTransactions);
      } else {
        const response = await fetch("/api/transactions");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setTransactions(data.data || data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      if (testMode === "api") {
        setTransactions(mockTransactions);
        setError(`${error} - Showing mock data instead`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode]);

  const filteredTransactions = transactions.filter(t => {
    if (filter !== "all" && t.type !== filter) return false;
    if (dateRange !== "all") {
      const txDate = new Date(t.date);
      const now = new Date();
      const daysDiff = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dateRange === "30days" && daysDiff > 30) return false;
      if (dateRange === "90days" && daysDiff > 90) return false;
      if (dateRange === "year" && daysDiff > 365) return false;
    }
    return true;
  });

  const totalInvested = transactions
    .filter(t => t.type === "investment" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDistributed = transactions
    .filter(t => t.type === "distribution" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalFees = transactions
    .filter(t => t.type === "fee" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pendingAmount = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "investment":
      case "capital_call":
        return <ArrowDownIcon className="w-4 h-4 text-error-400" />;
      case "distribution":
        return <ArrowUpIcon className="w-4 h-4 text-success-400" />;
      case "fee":
        return <CurrencyDollarIcon className="w-4 h-4 text-warning-400" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-text-tertiary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "default"> = {
      completed: "success",
      processing: "warning",
      pending: "error",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      investment: "Investment",
      distribution: "Distribution",
      fee: "Fee",
      capital_call: "Capital Call",
    };
    return <span className="text-xs text-text-secondary">{labels[type] || type}</span>;
  };

  const exportData = () => {
    const csv = [
      ["ID", "Type", "Deal", "Amount", "Currency", "Date", "Status", "Description", "Reference"],
      ...filteredTransactions.map(t => [
        t.id,
        t.type,
        t.dealName,
        t.amount.toString(),
        t.currency,
        t.date,
        t.status,
        t.description || "",
        t.reference || "",
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background-deep p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Test Transactions Page</h1>
        <p className="text-text-secondary">Development page for testing transaction functionality</p>
      </div>

      {/* Controls */}
      <Card variant="glass" className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
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
            
            <div className="flex items-center gap-4 lg:ml-auto">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Types</option>
                <option value="investment">Investments</option>
                <option value="distribution">Distributions</option>
                <option value="fee">Fees</option>
                <option value="capital_call">Capital Calls</option>
              </Select>
              
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-40"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">Last Year</option>
              </Select>

              <Button
                variant="glass"
                size="sm"
                onClick={exportData}
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button
                variant="glass"
                size="sm"
                onClick={fetchTransactions}
                disabled={loading}
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
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
          title="Total Invested"
          value={formatCurrency(totalInvested)}
          subtitle="Capital deployed"
          icon={<ArrowDownIcon className="w-5 h-5" />}
          variant="gradient"
        />
        <KPICard
          title="Total Distributed"
          value={formatCurrency(totalDistributed)}
          subtitle="Returns received"
          icon={<ArrowUpIcon className="w-5 h-5" />}
          variant="elevated"
          change={totalDistributed > 0 ? 15 : 0}
          changeType="increase"
        />
        <KPICard
          title="Total Fees"
          value={formatCurrency(totalFees)}
          subtitle="Fees paid"
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          variant="glass"
        />
        <KPICard
          title="Pending"
          value={formatCurrency(pendingAmount)}
          subtitle="Awaiting processing"
          icon={<CalendarDaysIcon className="w-5 h-5" />}
          variant="gradient"
          glow
        />
      </KPIGrid>

      {/* Transactions Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            Transaction History
            <span className="ml-2 text-sm text-text-secondary">
              ({filteredTransactions.length} transactions)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Transaction</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Deal</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          {getTypeBadge(transaction.type)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-medium">{transaction.id}</div>
                          <div className="text-xs text-text-tertiary mt-1">{transaction.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">
                        {transaction.dealName}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${
                          transaction.type === "distribution" ? "text-success-400" : 
                          transaction.type === "fee" ? "text-warning-400" : 
                          "text-error-400"
                        }`}>
                          {transaction.type === "distribution" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-4 px-4 text-text-secondary text-sm">
                        {transaction.reference || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card variant="glass" className="mt-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Net Position:</span>
              <span className={`ml-2 font-medium ${totalDistributed - totalInvested - totalFees >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                {formatCurrency(totalDistributed - totalInvested - totalFees)}
              </span>
            </div>
            <div>
              <span className="text-text-secondary">Total Transactions:</span>
              <span className="ml-2 text-white font-medium">{filteredTransactions.length}</span>
            </div>
            <div>
              <span className="text-text-secondary">Completed:</span>
              <span className="ml-2 text-white font-medium">
                {filteredTransactions.filter(t => t.status === "completed").length}
              </span>
            </div>
            <div>
              <span className="text-text-secondary">Pending:</span>
              <span className="ml-2 text-warning-400 font-medium">
                {filteredTransactions.filter(t => t.status === "pending").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}