"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ServerIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  CodeBracketIcon,
  PlayIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

interface ApiEndpoint {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  category: string;
  description: string;
  authentication: boolean;
  rateLimit?: string;
  cache?: string;
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
  examples?: ApiExample[];
  deprecated?: boolean;
  since?: string;
}

interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
  enum?: string[];
}

interface ApiRequestBody {
  type: string;
  required: boolean;
  schema: any;
  example?: any;
}

interface ApiResponse {
  status: number;
  description: string;
  schema?: any;
  example?: any;
}

interface ApiExample {
  title: string;
  description?: string;
  request?: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response?: {
    status: number;
    body: any;
  };
}

export default function ApiDocumentationPortal() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadApiDocumentation();
  }, []);

  const loadApiDocumentation = () => {
    // Load API documentation
    const docs: ApiEndpoint[] = [
      // Dashboard APIs
      {
        id: "dashboard-summary",
        path: "/api/dashboard/summary",
        method: "GET",
        category: "Dashboard",
        description: "Get dashboard summary with portfolio metrics",
        authentication: true,
        rateLimit: "100/min",
        cache: "5 minutes",
        parameters: [
          {
            name: "period",
            type: "string",
            required: false,
            description: "Time period for metrics",
            enum: ["day", "week", "month", "quarter", "year"],
            default: "month"
          }
        ],
        responses: [
          {
            status: 200,
            description: "Success",
            example: {
              totalInvestment: 2500000,
              totalReturns: 450000,
              activeDeals: 12,
              portfolioValue: 2950000
            }
          }
        ],
        since: "v1.0.0"
      },
      
      // Deals APIs
      {
        id: "deals-list",
        path: "/api/deals",
        method: "GET",
        category: "Deals",
        description: "List all available investment deals",
        authentication: true,
        rateLimit: "100/min",
        cache: "1 minute",
        parameters: [
          {
            name: "status",
            type: "string",
            required: false,
            description: "Filter by deal status",
            enum: ["active", "closed", "upcoming"],
            default: "active"
          },
          {
            name: "page",
            type: "integer",
            required: false,
            description: "Page number for pagination",
            default: 1
          },
          {
            name: "limit",
            type: "integer",
            required: false,
            description: "Number of items per page",
            default: 10
          }
        ],
        responses: [
          {
            status: 200,
            description: "Success",
            schema: {
              type: "object",
              properties: {
                data: { type: "array" },
                pagination: { type: "object" }
              }
            }
          }
        ],
        since: "v1.0.0"
      },
      {
        id: "deals-get",
        path: "/api/deals/{id}",
        method: "GET",
        category: "Deals",
        description: "Get details of a specific deal",
        authentication: true,
        rateLimit: "100/min",
        cache: "5 minutes",
        parameters: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Deal ID"
          }
        ],
        responses: [
          {
            status: 200,
            description: "Success"
          },
          {
            status: 404,
            description: "Deal not found"
          }
        ],
        since: "v1.0.0"
      },
      {
        id: "deals-create",
        path: "/api/deals",
        method: "POST",
        category: "Deals",
        description: "Create a new investment deal",
        authentication: true,
        rateLimit: "10/min",
        requestBody: {
          type: "application/json",
          required: true,
          schema: {
            type: "object",
            properties: {
              companyName: { type: "string" },
              targetAmount: { type: "number" },
              minInvestment: { type: "number" },
              description: { type: "string" }
            }
          }
        },
        responses: [
          {
            status: 201,
            description: "Deal created successfully"
          }
        ],
        since: "v1.1.0"
      },
      
      // Transactions APIs
      {
        id: "transactions-list",
        path: "/api/transactions",
        method: "GET",
        category: "Transactions",
        description: "List all transactions for the authenticated user",
        authentication: true,
        rateLimit: "100/min",
        cache: "30 seconds",
        parameters: [
          {
            name: "type",
            type: "string",
            required: false,
            description: "Filter by transaction type",
            enum: ["investment", "withdrawal", "dividend", "fee"]
          },
          {
            name: "from",
            type: "string",
            required: false,
            description: "Start date (ISO 8601)"
          },
          {
            name: "to",
            type: "string",
            required: false,
            description: "End date (ISO 8601)"
          }
        ],
        responses: [
          {
            status: 200,
            description: "Success"
          }
        ],
        since: "v1.0.0"
      },
      
      // Documents APIs
      {
        id: "documents-list",
        path: "/api/documents",
        method: "GET",
        category: "Documents",
        description: "List all documents for the authenticated user",
        authentication: true,
        rateLimit: "100/min",
        cache: "1 minute",
        parameters: [
          {
            name: "category",
            type: "string",
            required: false,
            description: "Filter by document category",
            enum: ["legal", "financial", "tax", "report", "agreement"]
          }
        ],
        responses: [
          {
            status: 200,
            description: "Success"
          }
        ],
        since: "v1.0.0"
      },
      {
        id: "documents-upload",
        path: "/api/documents/upload",
        method: "POST",
        category: "Documents",
        description: "Upload a new document",
        authentication: true,
        rateLimit: "10/min",
        requestBody: {
          type: "multipart/form-data",
          required: true,
          schema: {
            type: "object",
            properties: {
              file: { type: "file" },
              category: { type: "string" },
              description: { type: "string" }
            }
          }
        },
        responses: [
          {
            status: 201,
            description: "Document uploaded successfully"
          }
        ],
        since: "v1.1.0"
      },
      
      // Cache APIs
      {
        id: "cache-stats",
        path: "/api/cache/stats",
        method: "GET",
        category: "System",
        description: "Get cache statistics and health",
        authentication: false,
        rateLimit: "10/sec",
        responses: [
          {
            status: 200,
            description: "Cache statistics",
            example: {
              stats: {
                hits: 1234,
                misses: 56,
                hitRate: 95.6,
                size: 789
              },
              health: {
                status: "healthy"
              }
            }
          }
        ],
        since: "v1.2.0"
      },
      {
        id: "cache-invalidate",
        path: "/api/cache/invalidate",
        method: "POST",
        category: "System",
        description: "Invalidate cache entries",
        authentication: true,
        rateLimit: "10/min",
        requestBody: {
          type: "application/json",
          required: true,
          schema: {
            type: "object",
            properties: {
              pattern: { type: "string" },
              tags: { type: "array" },
              all: { type: "boolean" }
            }
          }
        },
        responses: [
          {
            status: 200,
            description: "Cache invalidated"
          }
        ],
        since: "v1.2.0"
      },
      
      // Health APIs
      {
        id: "health-check",
        path: "/api/health",
        method: "GET",
        category: "System",
        description: "Health check endpoint",
        authentication: false,
        rateLimit: "unlimited",
        responses: [
          {
            status: 200,
            description: "System is healthy",
            example: {
              status: "healthy",
              services: {
                database: "connected",
                cache: "connected",
                supabase: "connected"
              }
            }
          }
        ],
        since: "v1.0.0"
      },
      {
        id: "health-supabase",
        path: "/api/health/supabase",
        method: "GET",
        category: "System",
        description: "Check Supabase connection health",
        authentication: false,
        rateLimit: "10/min",
        responses: [
          {
            status: 200,
            description: "Supabase is connected"
          },
          {
            status: 503,
            description: "Supabase is unavailable"
          }
        ],
        since: "v1.0.0"
      },
      
      // Admin APIs
      {
        id: "admin-metrics",
        path: "/api/admin/metrics",
        method: "GET",
        category: "Admin",
        description: "Get admin dashboard metrics",
        authentication: true,
        rateLimit: "100/min",
        cache: "1 minute",
        responses: [
          {
            status: 200,
            description: "Admin metrics"
          }
        ],
        since: "v1.1.0"
      }
    ];

    setEndpoints(docs);
    
    // Auto-expand first category
    if (docs.length > 0) {
      const firstCategory = docs[0].category;
      setExpandedCategories(new Set([firstCategory]));
      setSelectedEndpoint(docs[0]);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-green-500 bg-green-500/10";
      case "POST": return "text-blue-500 bg-blue-500/10";
      case "PUT": return "text-yellow-500 bg-yellow-500/10";
      case "DELETE": return "text-red-500 bg-red-500/10";
      case "PATCH": return "text-purple-500 bg-purple-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const testEndpoint = async () => {
    if (!selectedEndpoint) return;

    setTestMode(true);
    setTestResult(null);

    try {
      const response = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setTestResult({
        error: message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorizedEndpoints = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">API Documentation Portal</h1>
        <p className="text-muted-foreground">
          Interactive documentation for all available API endpoints
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Endpoint List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Endpoints</CardTitle>
                <Badge>{endpoints.length} total</Badge>
              </div>
              <input
                type="text"
                placeholder="Search endpoints..."
                className="mt-3 w-full px-3 py-2 bg-card rounded-lg text-foreground placeholder-text-tertiary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {Object.entries(categorizedEndpoints).map(([category, categoryEndpoints]) => (
                  <div key={category} className="border-b border-border last:border-0">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-card transition-colors"
                    >
                      <span className="font-medium text-foreground">{category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{categoryEndpoints.length}</Badge>
                        {expandedCategories.has(category) ? (
                          <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    
                    {expandedCategories.has(category) && (
                      <div className="bg-surface-base">
                        {categoryEndpoints.map((endpoint) => (
                          <button
                            key={endpoint.id}
                            onClick={() => setSelectedEndpoint(endpoint)}
                            className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-card transition-colors ${
                              selectedEndpoint?.id === endpoint.id ? "bg-card border-l-2 border-primary" : ""
                            }`}
                          >
                            <Badge className={`text-xs px-2 py-0.5 ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </Badge>
                            <div className="flex-1 text-left">
                              <div className="text-sm text-foreground truncate">
                                {endpoint.path}
                              </div>
                              {endpoint.deprecated && (
                                <Badge variant="warning" className="text-xs mt-1">Deprecated</Badge>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Endpoint Details */}
        <div className="lg:col-span-2">
          {selectedEndpoint ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`text-sm px-3 py-1 ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </Badge>
                      <code className="text-lg font-mono text-foreground">
                        {selectedEndpoint.path}
                      </code>
                    </div>
                    <p className="text-muted-foreground mt-2">{selectedEndpoint.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedEndpoint.authentication && (
                        <Badge variant="outline">
                          <ShieldCheckIcon className="w-3 h-3 mr-1" />
                          Auth Required
                        </Badge>
                      )}
                      {selectedEndpoint.rateLimit && (
                        <Badge variant="outline">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {selectedEndpoint.rateLimit}
                        </Badge>
                      )}
                      {selectedEndpoint.cache && (
                        <Badge variant="outline">
                          <BoltIcon className="w-3 h-3 mr-1" />
                          Cached: {selectedEndpoint.cache}
                        </Badge>
                      )}
                      {selectedEndpoint.since && (
                        <Badge variant="info">
                          Since {selectedEndpoint.since}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(selectedEndpoint.path)}
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={testEndpoint}
                      disabled={selectedEndpoint.method !== "GET" || selectedEndpoint.authentication}
                    >
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="parameters" className="w-full">
                  <TabsList>
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    {selectedEndpoint.requestBody && <TabsTrigger value="request">Request Body</TabsTrigger>}
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                    {testResult && <TabsTrigger value="test">Test Result</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="parameters" className="mt-4">
                    {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEndpoint.parameters.map((param) => (
                          <div key={param.name} className="p-3 bg-card rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <code className="font-mono text-sm text-foreground">
                                    {param.name}
                                  </code>
                                  <Badge variant="outline" className="text-xs">
                                    {param.type}
                                  </Badge>
                                  {param.required && (
                                    <Badge variant="error" className="text-xs">Required</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {param.description}
                                </p>
                                {param.enum && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {param.enum.map((value) => (
                                      <Badge key={value} variant="info" className="text-xs">
                                        {value}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {param.default !== undefined && (
                                  <div className="mt-2 text-xs text-muted-foreground/70">
                                    Default: <code>{JSON.stringify(param.default)}</code>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No parameters required</p>
                    )}
                  </TabsContent>
                  
                  {selectedEndpoint.requestBody && (
                    <TabsContent value="request" className="mt-4">
                      <div className="p-3 bg-card rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{selectedEndpoint.requestBody.type}</Badge>
                          {selectedEndpoint.requestBody.required && (
                            <Badge variant="error" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {selectedEndpoint.requestBody.schema && (
                          <pre className="mt-3 p-3 bg-surface-base rounded text-xs overflow-x-auto">
                            <code>{JSON.stringify(selectedEndpoint.requestBody.schema, null, 2)}</code>
                          </pre>
                        )}
                      </div>
                    </TabsContent>
                  )}
                  
                  <TabsContent value="responses" className="mt-4">
                    <div className="space-y-3">
                      {selectedEndpoint.responses.map((response, idx) => (
                        <div key={idx} className="p-3 bg-card rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={response.status < 300 ? "success" : response.status < 400 ? "warning" : "error"}>
                              {response.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{response.description}</span>
                          </div>
                          {response.example && (
                            <pre className="mt-3 p-3 bg-surface-base rounded text-xs overflow-x-auto">
                              <code>{JSON.stringify(response.example, null, 2)}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  {testResult && (
                    <TabsContent value="test" className="mt-4">
                      <div className="p-3 bg-card rounded-lg">
                        {testResult.error ? (
                          <div className="text-red-500">
                            <p className="font-medium">Error:</p>
                            <p className="text-sm mt-1">{testResult.error}</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant={testResult.status < 300 ? "success" : "error"}>
                                {testResult.status} {testResult.statusText}
                              </Badge>
                              <span className="text-xs text-muted-foreground/70">{testResult.timestamp}</span>
                            </div>
                            <pre className="p-3 bg-surface-base rounded text-xs overflow-x-auto">
                              <code>{JSON.stringify(testResult.data, null, 2)}</code>
                            </pre>
                          </>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-muted-foreground/70 mb-3" />
                <p className="text-muted-foreground">Select an endpoint to view documentation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}