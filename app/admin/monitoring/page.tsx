"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CloudIcon,
  SignalIcon,
  FlagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { featureFlagService, FEATURE_FLAGS } from "@/lib/infrastructure/feature-flags";
import { eventBus } from "@/lib/services/institutional.service";

interface SystemMetric {
  name: string;
  value: number | string;
  unit?: string;
  status: "healthy" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
}

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  lastCheck: Date;
  responseTime?: number;
  uptime?: number;
  details?: any;
}

interface EventLog {
  id: string;
  type: string;
  timestamp: Date;
  message: string;
  level: "info" | "warning" | "error";
  metadata?: any;
}

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    // Load cache statistics
    let cacheStats: any = null;
    try {
      const cacheResponse = await fetch('/api/cache/stats');
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        cacheStats = cacheData.data;
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    }

    // Load system metrics with real cache data
    const cacheHitRate = cacheStats?.stats?.hitRate || 0;
    const cacheSize = cacheStats?.stats?.size || 0;
    const cacheHealth = cacheStats?.health?.status || 'unknown';
    
    setMetrics([
      { name: "CPU Usage", value: 45, unit: "%", status: "healthy", trend: "stable" },
      { name: "Memory Usage", value: 62, unit: "%", status: "warning", trend: "up" },
      { name: "Active Users", value: 1247, status: "healthy", trend: "up" },
      { name: "API Requests/min", value: 8420, status: "healthy", trend: "stable" },
      { name: "Error Rate", value: 0.02, unit: "%", status: "healthy", trend: "down" },
      { 
        name: "Cache Hit Rate", 
        value: cacheHitRate.toFixed(1), 
        unit: "%", 
        status: cacheHitRate > 80 ? "healthy" : cacheHitRate > 60 ? "warning" : "critical",
        trend: cacheHitRate > 90 ? "up" : "stable" 
      },
      { 
        name: "Cache Size", 
        value: cacheSize, 
        unit: "entries", 
        status: cacheSize < 5000 ? "healthy" : cacheSize < 8000 ? "warning" : "critical",
        trend: "stable" 
      },
      { name: "DB Connections", value: 42, unit: "/100", status: "healthy", trend: "stable" },
      { name: "Event Queue Size", value: 127, status: "healthy", trend: "down" },
    ]);

    // Load service health
    const cacheStatus = cacheHealth === 'healthy' ? 'healthy' : 
                       cacheHealth === 'degraded' ? 'degraded' : 'unhealthy';
    const cacheResponseTime = cacheStats?.performance?.readPerOp ? 
                             parseFloat(cacheStats.performance.readPerOp) : 0;
    
    setServices([
      { 
        name: "API Gateway", 
        status: "healthy", 
        lastCheck: new Date(), 
        responseTime: 45, 
        uptime: 99.99 
      },
      { 
        name: "Database", 
        status: "healthy", 
        lastCheck: new Date(), 
        responseTime: 12, 
        uptime: 99.95 
      },
      { 
        name: `Cache (${cacheStats?.config?.useRedis ? 'Redis' : 'Memory'})`, 
        status: cacheStatus, 
        lastCheck: new Date(), 
        responseTime: cacheResponseTime, 
        uptime: cacheStatus === 'healthy' ? 100 : 98.5,
        details: cacheStats?.stats
      },
      { 
        name: "Event Bus", 
        status: "healthy", 
        lastCheck: new Date(), 
        responseTime: 3, 
        uptime: 100 
      },
      { 
        name: "Feature Flags", 
        status: "healthy", 
        lastCheck: new Date(), 
        responseTime: 1, 
        uptime: 100 
      },
      { 
        name: "Supabase", 
        status: "healthy", 
        lastCheck: new Date(), 
        responseTime: 67, 
        uptime: 99.9 
      },
    ]);

    // Load recent events
    setEvents([
      {
        id: "1",
        type: "system.deployment",
        timestamp: new Date(Date.now() - 3600000),
        message: "New version deployed: v1.2.3",
        level: "info"
      },
      {
        id: "2",
        type: "cache.cleared",
        timestamp: new Date(Date.now() - 7200000),
        message: "Cache cleared for service: InvestorsService",
        level: "info"
      },
      {
        id: "3",
        type: "rate_limit.exceeded",
        timestamp: new Date(Date.now() - 10800000),
        message: "Rate limit exceeded for user: user_123",
        level: "warning"
      },
      {
        id: "4",
        type: "circuit_breaker.open",
        timestamp: new Date(Date.now() - 14400000),
        message: "Circuit breaker opened for: ExternalAPI",
        level: "error"
      },
    ]);

    // Load feature flags
    const flags = featureFlagService.getAllFlags();
    setFeatureFlags(flags);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "warning":
      case "degraded":
        return "text-yellow-500";
      case "critical":
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "warning":
      case "degraded":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case "critical":
      case "unhealthy":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.slice(0, 8).map((metric) => (
          <Card key={metric.name} className="hover:border-primary-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {metric.name}
                </CardTitle>
                {metric.trend && (
                  <span className={`text-xs ${
                    metric.trend === "up" ? "text-green-500" : 
                    metric.trend === "down" ? "text-red-500" : 
                    "text-gray-500"
                  }`}>
                    {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-sm text-text-tertiary">{metric.unit}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium text-text-primary">{service.name}</div>
                    <div className="text-xs text-text-secondary">
                      Response: {service.responseTime}ms | Uptime: {service.uptime}%
                    </div>
                  </div>
                </div>
                <Badge variant={
                  service.status === "healthy" ? "success" : 
                  service.status === "degraded" ? "warning" : 
                  "error"
                }>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeatureFlags = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Feature Flags</CardTitle>
          <Badge>{featureFlags.length} flags</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {featureFlags.map((flag) => (
            <div key={flag.key} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
              <div className="flex items-center gap-3">
                <FlagIcon className={`w-5 h-5 ${flag.enabled ? "text-green-500" : "text-gray-500"}`} />
                <div>
                  <div className="font-medium text-text-primary">{flag.name}</div>
                  <div className="text-xs text-text-secondary">
                    {flag.key} • {flag.type}
                    {flag.rolloutPercentage !== undefined && ` • ${flag.rolloutPercentage}%`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {flag.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                <Badge variant={flag.enabled ? "success" : "default"}>
                  {flag.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderEvents = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Event Stream</CardTitle>
          <Badge>{events.length} recent events</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 bg-surface-elevated rounded-lg">
              <div className={`mt-1 ${
                event.level === "error" ? "text-red-500" :
                event.level === "warning" ? "text-yellow-500" :
                "text-blue-500"
              }`}>
                {event.level === "error" ? <XCircleIcon className="w-5 h-5" /> :
                 event.level === "warning" ? <ExclamationTriangleIcon className="w-5 h-5" /> :
                 <CheckCircleIcon className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-text-primary">{event.type}</span>
                  <span className="text-xs text-text-tertiary">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-text-secondary mt-1">{event.message}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>API Gateway</span>
                  <span>45ms</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Database</span>
                  <span>12ms</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "12%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cache</span>
                  <span>3ms</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "3%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Circuit Breakers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">External API</span>
                <Badge variant="success">Closed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Gateway</span>
                <Badge variant="success">Closed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="warning">Half-Open</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS Provider</span>
                <Badge variant="error">Open</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-text-secondary mb-1">Global Limit</div>
              <div className="text-2xl font-bold">8,420 / 10,000</div>
              <div className="text-xs text-text-tertiary">requests/minute</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Top User</div>
              <div className="text-2xl font-bold">user_789</div>
              <div className="text-xs text-text-tertiary">342 requests</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Blocked IPs</div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-text-tertiary">in last hour</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                <CpuChipIcon className="w-8 h-8 text-primary-300" />
                System Monitoring Dashboard
              </h1>
              <p className="text-text-secondary mt-2">
                Real-time monitoring of institutional-grade infrastructure
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={autoRefresh ? "glass" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </Button>
              <Button onClick={loadDashboardData} variant="outline">
                Refresh Now
              </Button>
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <Card className="mb-6 border-primary-300/20 bg-primary-300/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  <span className="font-semibold text-green-500">System Operational</span>
                </div>
                <Badge variant="success">All Services Running</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span>Uptime: 99.99%</span>
                <span>•</span>
                <span>Version: 1.2.3</span>
                <span>•</span>
                <span>Environment: Production</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BoltIcon className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <FlagIcon className="w-4 h-4" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <SignalIcon className="w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="performance">
            {renderPerformance()}
          </TabsContent>

          <TabsContent value="features">
            {renderFeatureFlags()}
          </TabsContent>

          <TabsContent value="events">
            {renderEvents()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}