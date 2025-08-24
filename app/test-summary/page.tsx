// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { KPICard, KPIGrid, HeroKPICard } from "@/components/ui/KPICard";
import { LineChart, DoughnutChart } from "@/components/ui/Charts";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

interface TestResult {
  name: string;
  endpoint: string;
  status: "success" | "error" | "warning";
  responseTime: number;
  dataCount?: number;
  message?: string;
  timestamp: string;
}

interface SystemHealth {
  database: "healthy" | "degraded" | "error";
  api: "healthy" | "degraded" | "error";
  supabase: "healthy" | "degraded" | "error";
  cache: "healthy" | "degraded" | "error";
}

export default function TestSummaryPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: "healthy",
    api: "healthy",
    supabase: "healthy",
    cache: "healthy",
  });
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: TestResult[] = [];

    // Test endpoints
    const endpoints = [
      { name: "Deals API", endpoint: "/api/deals" },
      { name: "Transactions API", endpoint: "/api/transactions" },
      { name: "Investors API", endpoint: "/api/investors" },
      { name: "Documents API", endpoint: "/api/documents" },
      { name: "Dashboard API", endpoint: "/api/investors/1/dashboard" },
      { name: "Portfolio API", endpoint: "/api/investors/1/portfolio" },
      { name: "Health Check", endpoint: "/api/health" },
      { name: "Supabase Health", endpoint: "/api/health/supabase" },
    ];

    for (const test of endpoints) {
      const startTime = Date.now();
      try {
        const response = await fetch(test.endpoint);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          results.push({
            name: test.name,
            endpoint: test.endpoint,
            status: "success",
            responseTime,
            dataCount: Array.isArray(data.data) ? data.data.length : undefined,
            timestamp: new Date().toISOString(),
          });
        } else {
          results.push({
            name: test.name,
            endpoint: test.endpoint,
            status: response.status >= 500 ? "error" : "warning",
            responseTime,
            message: `HTTP ${response.status}`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          status: "error",
          responseTime: Date.now() - startTime,
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      }
    }

    setTestResults(results);

    // Update system health based on results
    const healthStatus: SystemHealth = {
      database: results.some(r => r.endpoint.includes("/api/") && r.status === "error") ? "error" : "healthy",
      api: results.filter(r => r.endpoint.includes("/api/")).every(r => r.status === "success") ? "healthy" : 
           results.filter(r => r.endpoint.includes("/api/")).some(r => r.status === "error") ? "error" : "degraded",
      supabase: results.find(r => r.endpoint.includes("supabase"))?.status === "success" ? "healthy" : "error",
      cache: "healthy", // Mock for now
    };
    setSystemHealth(healthStatus);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runTests, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const successCount = testResults.filter(r => r.status === "success").length;
  const errorCount = testResults.filter(r => r.status === "error").length;
  const warningCount = testResults.filter(r => r.status === "warning").length;
  const avgResponseTime = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length)
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-success-400" />;
      case "error":
        return <XCircleIcon className="w-5 h-5 text-error-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning-400" />;
      default:
        return null;
    }
  };

  const getHealthBadge = (health: string) => {
    const variants: Record<string, "success" | "warning" | "error"> = {
      healthy: "success",
      degraded: "warning",
      error: "error",
    };
    return <Badge variant={variants[health] || "default"}>{health.toUpperCase()}</Badge>;
  };

  // Chart data
  const statusChartData = {
    labels: ["Success", "Warnings", "Errors"],
    datasets: [{
      data: [successCount, warningCount, errorCount],
      backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
    }]
  };

  const responseTimeData = {
    labels: testResults.map(r => r.name.split(" ")[0]),
    datasets: [{
      label: "Response Time (ms)",
      data: testResults.map(r => r.responseTime),
      borderColor: "#C898FF",
      backgroundColor: "rgba(200, 152, 255, 0.1)",
    }]
  };

  return (
    <div className="min-h-screen bg-background-deep p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Test Summary Dashboard</h1>
          <p className="text-text-secondary">Comprehensive testing overview and system health</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "primary" : "glass"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={runTests}
            disabled={loading}
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
        </div>
      </div>

      {/* Hero KPI */}
      <HeroKPICard
        title="System Status"
        value={successCount === testResults.length ? "All Systems Operational" : `${errorCount} Issues Detected`}
        subtitle={`${testResults.length} tests completed | ${avgResponseTime}ms avg response`}
        trend={{
          value: Math.round((successCount / testResults.length) * 100) || 0,
          label: "success rate",
        }}
        className="mb-6"
      />

      {/* System Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CircleStackIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-secondary">Database</span>
              </div>
              {getHealthBadge(systemHealth.database)}
            </div>
            <div className="text-xs text-text-tertiary">Supabase PostgreSQL</div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ServerIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-secondary">API Server</span>
              </div>
              {getHealthBadge(systemHealth.api)}
            </div>
            <div className="text-xs text-text-tertiary">Next.js API Routes</div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CloudIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-secondary">Supabase</span>
              </div>
              {getHealthBadge(systemHealth.supabase)}
            </div>
            <div className="text-xs text-text-tertiary">Auth & Realtime</div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CpuChipIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-secondary">Cache</span>
              </div>
              {getHealthBadge(systemHealth.cache)}
            </div>
            <div className="text-xs text-text-tertiary">In-memory cache</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Metrics */}
      <KPIGrid className="mb-8">
        <KPICard
          title="Tests Passed"
          value={`${successCount}/${testResults.length}`}
          subtitle="Successful tests"
          icon={<CheckCircleIcon className="w-5 h-5" />}
          variant="gradient"
          change={successCount === testResults.length ? 100 : 0}
          changeType="increase"
        />
        <KPICard
          title="Avg Response"
          value={`${avgResponseTime}ms`}
          subtitle="Average latency"
          icon={<ChartBarIcon className="w-5 h-5" />}
          variant="elevated"
          change={avgResponseTime < 200 ? 10 : -5}
        />
        <KPICard
          title="Warnings"
          value={warningCount}
          subtitle="Non-critical issues"
          icon={<ExclamationTriangleIcon className="w-5 h-5" />}
          variant="glass"
        />
        <KPICard
          title="Errors"
          value={errorCount}
          subtitle="Critical failures"
          icon={<XCircleIcon className="w-5 h-5" />}
          variant="gradient"
          glow={errorCount > 0}
        />
      </KPIGrid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Test Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <DoughnutChart data={statusChartData} />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <LineChart data={responseTimeData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            Test Results
            <span className="ml-2 text-sm text-text-secondary">
              Last run: {testResults[0]?.timestamp ? new Date(testResults[0].timestamp).toLocaleTimeString() : "Never"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : testResults.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No test results yet. Click "Run Tests" to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Test Name</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Endpoint</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Response Time</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Data Count</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                      <td className="py-4 px-4">
                        {getStatusIcon(result.status)}
                      </td>
                      <td className="py-4 px-4 text-white font-medium">
                        {result.name}
                      </td>
                      <td className="py-4 px-4 text-text-secondary text-sm">
                        <code className="bg-surface-base px-2 py-1 rounded">
                          {result.endpoint}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${
                          result.responseTime < 200 ? "text-success-400" :
                          result.responseTime < 500 ? "text-warning-400" :
                          "text-error-400"
                        }`}>
                          {result.responseTime}ms
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white">
                        {result.dataCount !== undefined ? result.dataCount : "-"}
                      </td>
                      <td className="py-4 px-4 text-text-secondary text-sm">
                        {result.message || "OK"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card variant="glass" className="mt-6">
        <CardHeader>
          <CardTitle>Quick Test Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/test-deals" className="block p-3 bg-surface-base rounded-lg hover:bg-surface-hover transition-colors">
              <p className="text-white font-medium">Test Deals</p>
              <p className="text-xs text-text-secondary">Deal functionality</p>
            </a>
            <a href="/test-transactions" className="block p-3 bg-surface-base rounded-lg hover:bg-surface-hover transition-colors">
              <p className="text-white font-medium">Test Transactions</p>
              <p className="text-xs text-text-secondary">Transaction flows</p>
            </a>
            <a href="/test-real-data" className="block p-3 bg-surface-base rounded-lg hover:bg-surface-hover transition-colors">
              <p className="text-white font-medium">Test Real Data</p>
              <p className="text-xs text-text-secondary">Supabase connection</p>
            </a>
            <a href="/investor-portal/dashboard" className="block p-3 bg-surface-base rounded-lg hover:bg-surface-hover transition-colors">
              <p className="text-white font-medium">Investor Portal</p>
              <p className="text-xs text-text-secondary">Main dashboard</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}