"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import {
  OverviewSection,
  ColorsSection,
  TypographySection,
  ComponentsSection,
  FormsSection,
  DataDisplaySection,
  MotionSection,
  PatternsSection,
} from "@/components/style-guide/tabs";

// Inner component that uses the theme
function StyleGuideContent() {
  const [activeTab, setActiveTab] = useState("overview");
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "components", label: "Components" },
    { id: "forms", label: "Forms" },
    { id: "data", label: "Data Display" },
    { id: "motion", label: "Motion" },
    { id: "patterns", label: "Patterns" },
  ];

  const colorSchemes = [
    { id: "purple", label: "Purple", color: "bg-purple-500" },
    { id: "blue", label: "Electric", color: "bg-blue-500" },
    { id: "green", label: "Racing", color: "bg-green-600" },
    { id: "mono", label: "Mono", color: "bg-gray-700" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection />;
      case "colors":
        return <ColorsSection />;
      case "typography":
        return <TypographySection />;
      case "components":
        return <ComponentsSection />;
      case "forms":
        return <FormsSection />;
      case "data":
        return <DataDisplaySection />;
      case "motion":
        return <MotionSection />;
      case "patterns":
        return <PatternsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Background gradient mesh */}
        <div className="fixed inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-300 via-accent-blue to-accent-green text-gradient animate-gradient">
                    Equitie Design System
                  </h1>
                  <p className="mt-3 text-lg text-muted-foreground">
                    Complete style guide with modern components, animations, and
                    interactions
                  </p>
                </div>

                {/* Theme and Color Scheme Toggle */}
                <div className="flex flex-col gap-3 ml-8">
                  {/* Theme Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Theme:</span>
                    <div className="flex items-center p-1 bg-card rounded-lg border border-border">
                      <button
                        onClick={() => setTheme("dark")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          theme === "dark"
                            ? "bg-primary-300 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme("light")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          theme === "light"
                            ? "bg-primary-300 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  {/* Color Scheme Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Colors:</span>
                    <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
                      {colorSchemes.map((scheme) => (
                        <button
                          key={scheme.id}
                          onClick={() => setColorScheme(scheme.id as any)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            colorScheme === scheme.id
                              ? `${scheme.color} text-white shadow-sm`
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {scheme.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    size="sm"
                    variant={activeTab === tab.id ? "primary" : "glass"}
                    onClick={() => setActiveTab(tab.id)}
                    className="whitespace-nowrap"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export that provides the context
export default function StyleGuidePage() {
  const [mounted, setMounted] = useState(false);
  // Defer rendering until after mount to satisfy ThemeProvider's mount guard
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <ThemeProvider>
      <StyleGuideContent />
    </ThemeProvider>
  );
}
