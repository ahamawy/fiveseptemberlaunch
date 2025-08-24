"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { KPICard, KPIGrid, HeroKPICard } from "@/components/ui/KPICard";
import {
  CloudIcon,
  CommandLineIcon,
  CircleStackIcon,
  DocumentMagnifyingGlassIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CpuChipIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getSupabaseMCP } from "@/lib/mcp/supabase-utils";

interface MCPAction {
  name: string;
  description: string;
  category: 'query' | 'analyze' | 'debug' | 'report';
  params?: Record<string, any>;
}

export default function SupabaseMCPPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<MCPAction | null>(null);
  const [queryInput, setQueryInput] = useState("");
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const mcpActions: MCPAction[] = [
    {
      name: "Analyze Portfolio",
      description: "Deep analysis of investor portfolio with metrics",
      category: "analyze",
      params: { investorId: 1 },
    },
    {
      name: "Debug Transaction",
      description: "Debug transaction issues with detailed logs",
      category: "debug",
      params: { transactionId: "TXN-001" },
    },
    {
      name: "Validate Fees",
      description: "Validate fee calculations against rules",
      category: "analyze",
      params: { dealId: 1, amount: 1000000 },
    },
    {
      name: "Generate Performance Report",
      description: "Generate performance metrics report",
      category: "report",
      params: { reportType: "performance" },
    },
    {
      name: "Health Check",
      description: "Check Supabase connection health",
      category: "debug",
    },
    {
      name: "Query Builder",
      description: "Build and execute custom queries",
      category: "query",
    },
  ];

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const mcp = getSupabaseMCP();
      const health = await mcp.healthCheck();
      setHealthStatus(health);
      setConnected(health.success);
    } catch (error) {
      setConnected(false);
      setHealthStatus({ 
        success: false, 
        error: error instanceof Error ? error.message : "Connection failed" 
      });
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: MCPAction) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const mcp = getSupabaseMCP();
      let result: any;

      switch (action.name) {
        case "Analyze Portfolio":
          result = await mcp.analyzePortfolio(action.params?.investorId || 1);
          break;
        
        case "Debug Transaction":
          result = await mcp.debugTransaction(action.params?.transactionId || "TXN-001");
          break;
        
        case "Validate Fees":
          result = await mcp.validateFees(
            action.params?.dealId || 1,
            action.params?.amount || 1000000
          );
          break;
        
        case "Generate Performance Report":
          result = await mcp.generateReport("performance", {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          });
          break;
        
        case "Health Check":
          result = await mcp.healthCheck();
          setHealthStatus(result);
          break;
        
        case "Query Builder":
          if (!queryInput) {
            result = { success: false, error: "Query input required" };
          } else {
            result = await mcp.executeQuery(JSON.parse(queryInput));
          }
          break;
        
        default:
          result = { success: false, error: "Unknown action" };
      }

      const executionTime = Date.now() - startTime;
      
      setResults([
        {
          action: action.name,
          timestamp: new Date().toISOString(),
          executionTime,
          ...result,
        },
        ...results.slice(0, 9), // Keep last 10 results
      ]);
    } catch (error) {
      setResults([
        {
          action: action.name,
          timestamp: new Date().toISOString(),
          executionTime: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : "Execution failed",
        },
        ...results.slice(0, 9),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatResult = (result: any) => {
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "default"> = {
      query: "default",
      analyze: "success",
      debug: "warning",
      report: "error",
    };
    return <Badge variant={variants[category] || "default"}>{category.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background-deep p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Supabase MCP Integration</h1>
          <p className="text-text-secondary">
            Enhanced Supabase integration using Model Context Protocol
          </p>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={checkConnection}
          disabled={loading}
        >
          <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Connection
        </Button>
      </div>

      {/* Connection Status */}
      <Card variant="glass" className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudIcon className={`w-6 h-6 ${connected ? 'text-success-400' : 'text-error-400'}`} />
              <div>
                <p className="text-white font-medium">MCP Server Status</p>
                <p className="text-sm text-text-secondary">
                  {connected 
                    ? "Connected to Supabase via MCP" 
                    : "MCP server not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={connected ? "success" : "error"}>
                {connected ? "CONNECTED" : "DISCONNECTED"}
              </Badge>
              {healthStatus && (
                <div className="text-xs text-text-tertiary">
                  Project: {healthStatus.projectId || "unknown"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <KPIGrid className="mb-8">
        <KPICard
          title="MCP Status"
          value={connected ? "Active" : "Inactive"}
          subtitle="Server connection"
          icon={<CpuChipIcon className="w-5 h-5" />}
          variant="gradient"
        />
        <KPICard
          title="Actions Available"
          value={mcpActions.length}
          subtitle="MCP tools"
          icon={<CommandLineIcon className="w-5 h-5" />}
          variant="elevated"
        />
        <KPICard
          title="Queries Run"
          value={results.filter(r => r.success).length}
          subtitle="Successful operations"
          icon={<ChartBarIcon className="w-5 h-5" />}
          variant="glass"
        />
        <KPICard
          title="Avg Response"
          value={`${Math.round(
            results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / 
            (results.length || 1)
          )}ms`}
          subtitle="Execution time"
          icon={<BoltIcon className="w-5 h-5" />}
          variant="gradient"
          glow
        />
      </KPIGrid>

      {/* Main Content */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actions">MCP Actions</TabsTrigger>
          <TabsTrigger value="query">Query Builder</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Available MCP Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mcpActions.map((action, index) => (
                  <div
                    key={index}
                    className="p-4 bg-surface-base rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => setSelectedAction(action)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{action.name}</h3>
                      {getCategoryBadge(action.category)}
                    </div>
                    <p className="text-sm text-text-secondary mb-3">
                      {action.description}
                    </p>
                    {action.params && (
                      <div className="p-2 bg-surface-elevated rounded text-xs text-text-tertiary">
                        <code>{JSON.stringify(action.params, null, 2)}</code>
                      </div>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        executeAction(action);
                      }}
                      disabled={loading}
                    >
                      Execute
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Builder Tab */}
        <TabsContent value="query">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Custom Query Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Query Templates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setQueryInput(JSON.stringify({
                        table: "investors.investor",
                        operation: "select",
                        limit: 10,
                      }, null, 2))}
                    >
                      Select Investors
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setQueryInput(JSON.stringify({
                        table: "transactions",
                        operation: "select",
                        filters: { type: "investment" },
                        orderBy: { column: "created_at", ascending: false },
                        limit: 5,
                      }, null, 2))}
                    >
                      Recent Investments
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setQueryInput(JSON.stringify({
                        table: "deals.deal",
                        operation: "select",
                        filters: { status: "active" },
                      }, null, 2))}
                    >
                      Active Deals
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setQueryInput(JSON.stringify({
                        table: "fees.fee_schedule",
                        operation: "select",
                        filters: { is_active: true },
                      }, null, 2))}
                    >
                      Active Fees
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Query JSON
                  </label>
                  <textarea
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    className="w-full h-64 p-3 bg-surface-base border border-surface-border rounded-lg text-white font-mono text-sm"
                    placeholder={JSON.stringify({
                      table: "table_name",
                      operation: "select | insert | update | delete",
                      filters: { field: "value" },
                      data: { field: "value" },
                      limit: 10,
                      orderBy: { column: "field", ascending: true }
                    }, null, 2)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => executeAction({
                      name: "Query Builder",
                      description: "Execute custom query",
                      category: "query",
                    })}
                    disabled={!queryInput.trim() || loading}
                  >
                    Execute Query
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Execution Results</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No results yet. Execute an action to see results.
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="p-4 bg-surface-base rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-white font-medium">{result.action}</span>
                          <span className="ml-2 text-xs text-text-tertiary">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircleIcon className="w-4 h-4 text-success-400" />
                          ) : (
                            <XCircleIcon className="w-4 h-4 text-error-400" />
                          )}
                          <span className="text-xs text-text-secondary">
                            {result.executionTime}ms
                          </span>
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="mb-2 p-2 bg-error-500/20 rounded text-error-400 text-sm">
                          {result.error}
                        </div>
                      )}
                      
                      {result.data && (
                        <div className="overflow-x-auto">
                          <pre className="text-xs text-text-tertiary">
                            {formatResult(result.data)}
                          </pre>
                        </div>
                      )}
                      
                      {result.metadata && (
                        <div className="mt-2 pt-2 border-t border-surface-border text-xs text-text-tertiary">
                          Rows: {result.metadata.rowCount || 0}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>MCP Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Setup Instructions</h3>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <span className="text-primary-300">1.</span>
                      <div>
                        <p className="text-white font-medium">Install MCP Dependencies</p>
                        <code className="block mt-1 p-2 bg-surface-base rounded text-xs">
                          npm install @modelcontextprotocol/sdk @supabase/mcp
                        </code>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-primary-300">2.</span>
                      <div>
                        <p className="text-white font-medium">Configure Environment</p>
                        <code className="block mt-1 p-2 bg-surface-base rounded text-xs">
                          {`SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key
MCP_SERVER_PORT=3001`}
                        </code>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-primary-300">3.</span>
                      <div>
                        <p className="text-white font-medium">Start MCP Server</p>
                        <code className="block mt-1 p-2 bg-surface-base rounded text-xs">
                          node lib/mcp/equitie-server.js
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Available Tools</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface-base rounded-lg">
                      <CodeBracketIcon className="w-5 h-5 text-primary-300 mb-2" />
                      <p className="text-white font-medium">analyze_portfolio</p>
                      <p className="text-xs text-text-tertiary">Deep portfolio analysis</p>
                    </div>
                    <div className="p-3 bg-surface-base rounded-lg">
                      <DocumentMagnifyingGlassIcon className="w-5 h-5 text-primary-300 mb-2" />
                      <p className="text-white font-medium">debug_transaction</p>
                      <p className="text-xs text-text-tertiary">Transaction debugging</p>
                    </div>
                    <div className="p-3 bg-surface-base rounded-lg">
                      <ChartBarIcon className="w-5 h-5 text-primary-300 mb-2" />
                      <p className="text-white font-medium">validate_fees</p>
                      <p className="text-xs text-text-tertiary">Fee validation</p>
                    </div>
                    <div className="p-3 bg-surface-base rounded-lg">
                      <CircleStackIcon className="w-5 h-5 text-primary-300 mb-2" />
                      <p className="text-white font-medium">generate_report</p>
                      <p className="text-xs text-text-tertiary">Custom reports</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warning-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-warning-400 mt-0.5" />
                    <div>
                      <p className="text-warning-400 font-medium">Security Note</p>
                      <p className="text-sm text-text-secondary mt-1">
                        MCP server uses service role key for full database access. 
                        Only use in secure environments and never expose to client-side code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}