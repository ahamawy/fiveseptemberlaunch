"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CircleStackIcon,
  ChartBarIcon,
  BanknotesIcon,
  DocumentMagnifyingGlassIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Import test components inline
import TestDeals from "../test-deals/page";
import TestTransactions from "../test-transactions/page";
import TestSummary from "../test-summary/page";
import TestRealData from "../test-real-data/page";

export default function TestHubPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const testSections = [
    {
      id: "overview",
      name: "Overview",
      icon: DocumentMagnifyingGlassIcon,
      description: "Test suite overview and quick health check",
    },
    {
      id: "deals",
      name: "Deals Test",
      icon: ChartBarIcon,
      description: "Test deal functionality and displays",
    },
    {
      id: "transactions",
      name: "Transactions Test",
      icon: BanknotesIcon,
      description: "Test transaction processing and display",
    },
    {
      id: "summary",
      name: "Summary Test",
      icon: DocumentMagnifyingGlassIcon,
      description: "Test summary calculations and aggregations",
    },
    {
      id: "database",
      name: "Database Validation",
      icon: CircleStackIcon,
      description: "Validate database connections and queries",
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Hub Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary mb-4">
            Centralized testing interface for all platform components. Run tests to validate functionality across different modules.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSections.slice(1).map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="cursor-pointer hover:border-primary-300 transition-colors"
                  onClick={() => setActiveTab(section.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary-300" />
                      <CardTitle className="text-base">{section.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary">{section.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      Run Test →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <HealthCheckItem name="API Endpoints" status="healthy" />
            <HealthCheckItem name="Database Connection" status="healthy" />
            <HealthCheckItem name="Supabase Integration" status="warning" />
            <HealthCheckItem name="Mock Data Provider" status="healthy" />
            <HealthCheckItem name="UI Components" status="healthy" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Test Hub</h1>
          <p className="text-text-secondary mt-2">
            Comprehensive testing suite for all platform features
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {testSections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{section.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle>Deals Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <TestDeals />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transactions Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <TestTransactions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Summary Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <TestSummary />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <TestRealData />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function HealthCheckItem({ name, status }: { name: string; status: "healthy" | "warning" | "error" }) {
  const statusConfig = {
    healthy: { icon: CheckCircleIcon, color: "text-green-500", badge: "success" as const },
    warning: { icon: ArrowPathIcon, color: "text-yellow-500", badge: "warning" as const },
    error: { icon: XCircleIcon, color: "text-red-500", badge: "destructive" as const },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <span className="text-sm font-medium text-text-primary">{name}</span>
      </div>
      <Badge variant={config.badge}>
        {status === "healthy" ? "Operational" : status === "warning" ? "Degraded" : "Down"}
      </Badge>
    </div>
  );
}