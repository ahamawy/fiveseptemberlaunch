"use client";

import { useState, useEffect } from "react";

// Professional SVG icons
const Icons = {
  chevronDown: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m19 9-7 7-7-7"
      />
    </svg>
  ),
  code: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  ),
  home: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      />
    </svg>
  ),
  chart: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
      />
    </svg>
  ),
  dollar: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
      />
    </svg>
  ),
  user: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
      />
    </svg>
  ),
  document: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
      />
    </svg>
  ),
  settings: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
      />
    </svg>
  ),
  palette: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4zM7 5H5v12a2 2 0 1 0 4 0V5zM15 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V5z"
      />
    </svg>
  ),
  link: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
      />
    </svg>
  ),
};

interface PageRoute {
  category: string;
  pages: {
    name: string;
    path: string;
    icon?: React.ReactNode;
    description?: string;
  }[];
}

const PAGE_ROUTES: PageRoute[] = [
  {
    category: "Investor Portal",
    pages: [
      {
        name: "Dashboard",
        path: "/investor-portal/dashboard",
        icon: Icons.home,
        description: "Main investor dashboard with metrics",
      },
      {
        name: "Portfolio",
        path: "/investor-portal/portfolio",
        icon: Icons.chart,
        description: "Investment portfolio overview",
      },
      {
        name: "Deals",
        path: "/investor-portal/deals",
        icon: Icons.chart,
        description: "Available investment deals",
      },
      {
        name: "Transactions",
        path: "/investor-portal/transactions",
        icon: Icons.dollar,
        description: "Transaction history and details",
      },
      {
        name: "Documents",
        path: "/investor-portal/documents",
        icon: Icons.document,
        description: "Document management",
      },
      {
        name: "Profile",
        path: "/investor-portal/profile",
        icon: Icons.user,
        description: "User profile and settings",
      },
      {
        name: "Select Investor",
        path: "/investor-portal/select",
        icon: Icons.user,
        description: "Pick an investor to view",
      },
    ],
  },
  {
    category: "Admin Dashboard",
    pages: [
      {
        name: "Overview",
        path: "/admin/dashboard",
        icon: Icons.home,
        description: "Platform metrics overview",
      },
      {
        name: "Deals",
        path: "/admin/deals",
        icon: Icons.chart,
        description: "Manage all deals",
      },
      {
        name: "Investors",
        path: "/admin/investors",
        icon: Icons.user,
        description: "Manage all investors",
      },
      {
        name: "Transactions",
        path: "/admin/transactions",
        icon: Icons.dollar,
        description: "View all transactions",
      },
      {
        name: "Companies",
        path: "/admin/companies",
        icon: Icons.document,
        description: "Manage companies",
      },
      {
        name: "Monitoring",
        path: "/admin/monitoring",
        icon: Icons.chart,
        description: "System monitoring dashboard",
      },
      {
        name: "API Docs",
        path: "/admin/api-docs",
        icon: Icons.document,
        description: "Interactive API documentation",
      },
    ],
  },
  {
    category: "Fee Management",
    pages: [
      {
        name: "Fees Hub",
        path: "/admin/fees",
        icon: Icons.settings,
        description: "Central fee management",
      },
      {
        name: "Fee Profiles",
        path: "/admin/fees/profiles",
        icon: Icons.settings,
        description: "Configure fee profiles",
      },
      {
        name: "Smart Import",
        path: "/admin/fees/smart-import",
        icon: Icons.link,
        description: "AI-assisted CSV mapping",
      },
      {
        name: "Import Tool",
        path: "/admin/fees/import",
        icon: Icons.document,
        description: "Import fee data",
      },
      {
        name: "Fee Editor",
        path: "/admin/fees/editor",
        icon: Icons.code,
        description: "Direct fee editing",
      },
      {
        name: "Bespoke Import",
        path: "/admin/fees/bespoke",
        icon: Icons.document,
        description: "Custom import interface",
      },
    ],
  },
  {
    category: "Quick API Access",
    pages: [
      {
        name: "Deals API",
        path: "/api/deals?limit=10",
        icon: Icons.link,
        description: "View deals data",
      },
      {
        name: "Transactions API",
        path: "/api/transactions?limit=10",
        icon: Icons.link,
        description: "View transactions",
      },
      {
        name: "Dashboard API",
        path: "/api/dashboard",
        icon: Icons.link,
        description: "Dashboard metrics",
      },
      {
        name: "Companies API",
        path: "/api/companies?limit=10",
        icon: Icons.link,
        description: "View companies",
      },
    ],
  },
  {
    category: "Development",
    pages: [
      {
        name: "Style Guide",
        path: "/style-guide",
        icon: Icons.palette,
        description: "Component library",
      },
      {
        name: "Test Hub",
        path: "/test-hub",
        icon: Icons.code,
        description: "Consolidated testing suite",
      },
    ],
  },
];

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [currentScheme, setCurrentScheme] = useState("purple");
  const [useMockData, setUseMockData] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Checking...");
  const [pageHealthStatus, setPageHealthStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Only show in development
    setIsDev(process.env.NODE_ENV === "development");
    setCurrentPath(window.location.pathname);

    // Get current theme/scheme from localStorage or DOM
    const storedTheme = localStorage.getItem("equitie-theme") || "dark";
    const storedScheme =
      localStorage.getItem("equitie-color-scheme") || "purple";
    setCurrentTheme(storedTheme);
    setCurrentScheme(storedScheme);

    // Get current data source
    const mockDataSetting = localStorage.getItem("equitie-use-mock-data");
    // Default to Supabase (no mock) unless explicitly set to 'true'
    setUseMockData(mockDataSetting === "true");

    // Check Supabase status
    checkSupabaseStatus();
    // Check page health status
    checkPageHealthStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    try {
      const response = await fetch("/api/health/supabase");
      const data = await response.json();

      if (data.connection.connected) {
        setSupabaseStatus("✅ Connected");
      } else if (data.connection.configured) {
        setSupabaseStatus("⚙️ Configured");
      } else {
        setSupabaseStatus("❌ Missing");
      }
    } catch (error) {
      setSupabaseStatus("❌ Error");
    }
  };

  const checkPageHealthStatus = async () => {
    // Quick health check for critical pages
    const criticalPages = [
      "/investor-portal/dashboard",
      "/admin/dashboard",
      "/api/deals",
      "/api/transactions",
    ];
    
    const healthMap: Record<string, boolean> = {};
    
    for (const page of criticalPages) {
      try {
        const response = await fetch(page, { method: "HEAD" });
        healthMap[page] = response.ok;
      } catch {
        healthMap[page] = false;
      }
    }
    
    setPageHealthStatus(healthMap);
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("equitie-theme", theme);

    // Update DOM
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  };

  const handleSchemeChange = (scheme: string) => {
    setCurrentScheme(scheme);
    localStorage.setItem("equitie-color-scheme", scheme);

    // Trigger a page reload to apply the new scheme
    window.location.reload();
  };

  const handleDataSourceChange = async (useMock: boolean) => {
    setUseMockData(useMock);
    localStorage.setItem("equitie-use-mock-data", useMock ? "true" : "false");

    // Clear all caches before switching
    try {
      // Clear service layer caches via API
      await fetch("/api/cache/clear", { method: "POST" });
    } catch (e) {
      console.log("Cache clear failed:", e);
    }

    // Update Supabase status after toggle
    setTimeout(() => checkSupabaseStatus(), 100);

    // Trigger a page reload to apply the new data source
    window.location.reload();
  };

  if (!isDev) return null;

  const navigateTo = (path: string) => {
    window.location.href = path;
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-end gap-3">
      {/* Page Navigation Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-300 text-white rounded-lg shadow-lg hover:bg-primary-400 transition-all duration-200 hover:scale-105"
        >
          {Icons.code}
          <span className="font-medium">Dev Menu</span>
          <span
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            {Icons.chevronDown}
          </span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-0 pointer-events-none" />

            {/* Dropdown Menu */}
            <div className="absolute bottom-full right-0 mb-2 w-80 max-h-[600px] overflow-y-auto bg-background-elevated border border-border rounded-xl shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-background-elevated border-b border-border p-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Quick Navigation
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Current:{" "}
                  <span className="text-primary-300">{currentPath || "/"}</span>
                </p>
              </div>

              {/* Page Routes */}
              <div className="p-2">
                {PAGE_ROUTES.map((category) => (
                  <div key={category.category} className="mb-4">
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                        {category.category}
                      </h4>
                    </div>
                    <div className="space-y-1">
                      {category.pages.map((page) => {
                        const isActive = currentPath === page.path;
                        const isHealthChecked = pageHealthStatus.hasOwnProperty(page.path);
                        const isHealthy = pageHealthStatus[page.path];

                        return (
                          <button
                            key={page.path}
                            onClick={() => navigateTo(page.path)}
                            className={`
                              w-full flex items-start gap-3 px-3 py-2.5 rounded-lg
                              transition-all duration-150 text-left
                              ${
                                isActive
                                  ? "bg-primary-300/20 text-primary-300 border border-primary-300/30"
                                  : "hover:bg-muted text-foreground hover:text-primary-300"
                              }
                            `}
                          >
                            {page.icon && (
                              <div className="mt-0.5 flex-shrink-0">
                                {page.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {page.name}
                                </span>
                                {isHealthChecked && (
                                  <span className={`text-xs ${isHealthy ? "text-green-500" : "text-red-500"}`}>
                                    {isHealthy ? "●" : "○"}
                                  </span>
                                )}
                              </div>
                              {page.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {page.description}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground/70 mt-1 font-mono">
                                {page.path}
                              </div>
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 bg-primary-300 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with Theme Controls */}
              <div className="sticky bottom-0 bg-background-elevated border-t border-border p-4 space-y-3">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        currentTheme === "dark"
                          ? "bg-primary-300 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        currentTheme === "light"
                          ? "bg-primary-300 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>

                {/* Color Scheme Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Colors</span>
                  <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
                    {["purple", "blue", "green", "monochrome"].map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => handleSchemeChange(scheme)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          currentScheme === scheme
                            ? "bg-primary-300 text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {scheme === "monochrome"
                          ? "Mono"
                          : scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Source Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Data Source
                  </span>
                  <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
                    <button
                      onClick={() => handleDataSourceChange(true)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        useMockData
                          ? "bg-primary-300 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Mock
                    </button>
                    <button
                      onClick={() => handleDataSourceChange(false)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        !useMockData
                          ? "bg-primary-300 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Supabase
                    </button>
                  </div>
                </div>

                {/* Environment Info */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/70">Environment</span>
                    <span className="text-primary-300 font-mono">
                      development
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground/70">Data Mode</span>
                    <span
                      className={`font-mono ${
                        useMockData ? "text-yellow-400" : "text-green-400"
                      }`}
                    >
                      {useMockData ? "🔧 Mock" : "🚀 Supabase"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground/70">Supabase</span>
                    <span className="font-mono text-sm">{supabaseStatus}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted-foreground/70">Host</span>
                    <span className="text-primary-300 font-mono">
                      {typeof window !== "undefined"
                        ? window.location.host
                        : "localhost"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Additional Dev Tools Button */}
      <button
        onClick={() => (window.location.href = "/style-guide")}
        className="p-2.5 bg-card border border-border rounded-lg shadow-lg hover:bg-muted transition-all duration-200 hover:scale-105 text-primary-300"
        title="Style Guide"
      >
        {Icons.palette}
      </button>
    </div>
  );
}
