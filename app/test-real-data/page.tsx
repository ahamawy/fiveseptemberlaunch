"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { KPICard, KPIGrid } from "@/components/ui/KPICard";
import {
  CircleStackIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TableCellsIcon,
  DocumentMagnifyingGlassIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface TableInfo {
  name: string;
  schema: string;
  rowCount?: number;
  columns?: string[];
  error?: string;
}

interface QueryResult {
  query: string;
  success: boolean;
  data?: any[];
  error?: string;
  executionTime: number;
  rowCount?: number;
}

export default function TestRealDataPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [customQuery, setCustomQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health/supabase");
      const data = await response.json();
      
      if (response.ok && data.data?.healthy) {
        setConnected(true);
        setConnectionInfo(data.data);
        await fetchTables();
      } else {
        setConnected(false);
        setConnectionInfo({ error: data.error || "Connection failed" });
      }
    } catch (error) {
      setConnected(false);
      setConnectionInfo({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      // Test key tables
      const testTables = [
        { name: "deals_clean", schema: "deals" },
        { name: "companies_clean", schema: "companies" },
        { name: "investors_clean", schema: "investors" },
        { name: "transactions", schema: "public" },
        { name: "documents", schema: "public" },
        { name: "deal_valuations", schema: "public" },
        { name: "fees.fee_schedule", schema: "fees" },
      ];

      const tableInfos: TableInfo[] = [];

      for (const table of testTables) {
        try {
          // Attempt to fetch count from each table
          const endpoint = table.name.includes(".")
            ? `/api/${table.name.split(".")[0]}`
            : `/api/${table.name}`;
          
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            tableInfos.push({
              name: table.name,
              schema: table.schema,
              rowCount: Array.isArray(data.data) ? data.data.length : 0,
            });
          } else {
            tableInfos.push({
              name: table.name,
              schema: table.schema,
              error: `HTTP ${response.status}`,
            });
          }
        } catch (error) {
          tableInfos.push({
            name: table.name,
            schema: table.schema,
            error: error instanceof Error ? error.message : "Failed to fetch",
          });
        }
      }

      setTables(tableInfos);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const executeQuery = async (query: string) => {
    const startTime = Date.now();
    const result: QueryResult = {
      query,
      success: false,
      executionTime: 0,
    };

    try {
      // Map common queries to API endpoints
      let endpoint = "";
      let method = "GET";
      let body = null;

      if (query.toLowerCase().includes("select * from deals")) {
        endpoint = "/api/deals";
      } else if (query.toLowerCase().includes("select * from transactions")) {
        endpoint = "/api/transactions";
      } else if (query.toLowerCase().includes("select * from investors")) {
        endpoint = "/api/investors";
      } else if (query.toLowerCase().includes("select * from documents")) {
        endpoint = "/api/documents";
      } else if (query.toLowerCase().includes("select * from companies")) {
        endpoint = "/api/companies";
      } else {
        throw new Error("Query not supported in test mode. Use API endpoints directly.");
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });

      result.executionTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        result.success = true;
        result.data = data.data || data;
        result.rowCount = Array.isArray(result.data) ? result.data.length : 1;
      } else {
        result.error = `HTTP ${response.status}`;
      }
    } catch (error) {
      result.executionTime = Date.now() - startTime;
      result.error = error instanceof Error ? error.message : "Query failed";
    }

    setQueryResults([result, ...queryResults.slice(0, 9)]); // Keep last 10 queries
    return result;
  };

  const loadTableData = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    
    try {
      const endpoint = tableName.includes(".")
        ? `/api/${tableName.split(".")[0]}`
        : `/api/${tableName}`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setTableData(Array.isArray(data.data) ? data.data.slice(0, 10) : []); // Show first 10 rows
      } else {
        setTableData([]);
      }
    } catch (error) {
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const predefinedQueries = [
    "SELECT * FROM deals LIMIT 10",
    "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10",
    "SELECT * FROM investors WHERE status = 'active'",
    "SELECT * FROM companies LIMIT 5",
    "SELECT * FROM documents WHERE type = 'termsheet'",
  ];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Test Real Data Connection</h1>
          <p className="text-muted-foreground">Direct Supabase database testing and validation</p>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={testConnection}
          disabled={loading}
        >
          <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Test Connection
        </Button>
      </div>

      {/* Connection Status */}
      <Card variant="glass" className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudIcon className={`w-6 h-6 ${connected ? 'text-success-400' : 'text-error-400'}`} />
              <div>
                <p className="text-white font-medium">Supabase Connection</p>
                <p className="text-sm text-muted-foreground">
                  {connected ? "Connected to production database" : "Not connected"}
                </p>
              </div>
            </div>
            <Badge variant={connected ? "success" : "error"}>
              {connected ? "CONNECTED" : "DISCONNECTED"}
            </Badge>
          </div>
          {connectionInfo && (
            <div className="mt-4 p-3 bg-surface-base rounded-lg">
              <pre className="text-xs text-muted-foreground overflow-x-auto">
                {JSON.stringify(connectionInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <KPIGrid className="mb-8">
        <KPICard
          title="Connection"
          value={connected ? "Active" : "Inactive"}
          subtitle="Database status"
          icon={<CircleStackIcon className="w-5 h-5" />}
          variant="gradient"
        />
        <KPICard
          title="Tables Found"
          value={tables.length}
          subtitle="Available tables"
          icon={<TableCellsIcon className="w-5 h-5" />}
          variant="elevated"
        />
        <KPICard
          title="Total Records"
          value={tables.reduce((sum, t) => sum + (t.rowCount || 0), 0)}
          subtitle="Across all tables"
          icon={<DocumentMagnifyingGlassIcon className="w-5 h-5" />}
          variant="glass"
        />
        <KPICard
          title="Queries Run"
          value={queryResults.length}
          subtitle="Test queries"
          icon={<CommandLineIcon className="w-5 h-5" />}
          variant="gradient"
          glow
        />
      </KPIGrid>

      {/* Main Content */}
      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="query">Query Runner</TabsTrigger>
          <TabsTrigger value="data">Data Browser</TabsTrigger>
        </TabsList>

        {/* Tables Tab */}
        <TabsContent value="tables">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Table Name</th>
                      <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Schema</th>
                      <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Row Count</th>
                      <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="py-4 px-4 text-white font-medium">
                          <code className="bg-surface-base px-2 py-1 rounded">
                            {table.name}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {table.schema}
                        </td>
                        <td className="py-4 px-4 text-white">
                          {table.rowCount !== undefined ? table.rowCount : "-"}
                        </td>
                        <td className="py-4 px-4">
                          {table.error ? (
                            <div className="flex items-center gap-2">
                              <XCircleIcon className="w-4 h-4 text-error-400" />
                              <span className="text-error-400 text-sm">{table.error}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-success-400" />
                              <span className="text-success-400 text-sm">Available</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => loadTableData(table.name)}
                            disabled={!!table.error}
                          >
                            Browse Data
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Tab */}
        <TabsContent value="query">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Query Runner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Quick Queries
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {predefinedQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="glass"
                        size="sm"
                        onClick={() => {
                          setCustomQuery(query);
                          executeQuery(query);
                        }}
                      >
                        {query.split(" ").slice(0, 4).join(" ")}...
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Custom Query (Limited to SELECT)
                  </label>
                  <textarea
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    className="w-full h-32 p-3 bg-surface-base border border-border rounded-lg text-white font-mono text-sm"
                    placeholder="SELECT * FROM deals LIMIT 10"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => executeQuery(customQuery)}
                    disabled={!customQuery.trim()}
                  >
                    Execute Query
                  </Button>
                </div>

                {/* Query Results */}
                {queryResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Query History</h3>
                    {queryResults.map((result, index) => (
                      <div key={index} className="p-4 bg-surface-base rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-sm text-primary-300">{result.query}</code>
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircleIcon className="w-4 h-4 text-success-400" />
                            ) : (
                              <XCircleIcon className="w-4 h-4 text-error-400" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {result.executionTime}ms
                            </span>
                          </div>
                        </div>
                        {result.error ? (
                          <div className="text-sm text-error-400">{result.error}</div>
                        ) : (
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">
                              Returned {result.rowCount} rows
                            </div>
                            {result.data && result.data.length > 0 && (
                              <div className="overflow-x-auto">
                                <pre className="text-xs text-muted-foreground/70">
                                  {JSON.stringify(result.data[0], null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Browser Tab */}
        <TabsContent value="data">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>
                Data Browser
                {selectedTable && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    - {selectedTable}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedTable ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a table from the Tables tab to browse its data
                </div>
              ) : loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data found in {selectedTable}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <pre className="text-xs text-white bg-surface-base p-4 rounded-lg">
                    {JSON.stringify(tableData, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Tips */}
      <Card variant="glass" className="mt-6">
        <CardHeader>
          <CardTitle>Connection Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-warning-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Environment Variables Required:</p>
                <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-success-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Mock Mode Override:</p>
                <code className="text-xs">NEXT_PUBLIC_USE_MOCK_DATA=false</code>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DocumentMagnifyingGlassIcon className="w-4 h-4 text-info-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Table Naming:</p>
                <p className="text-xs">Dot-named tables like &quot;deals_clean&quot; are in public schema</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}