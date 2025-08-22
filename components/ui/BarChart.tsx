"use client";

import React from "react";
import { BRAND_CONFIG } from "@/BRANDING/brand.config";

interface BarChartProps {
  labels: string[];
  values: number[];
  maxBars?: number;
}

export function BarChart({ labels, values, maxBars = 10 }: BarChartProps) {
  const items = labels.map((l, i) => ({ label: l, value: values[i] || 0 }));
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, maxBars);
  const max = Math.max(1, ...sorted.map((i) => i.value));
  const barColor = BRAND_CONFIG.colors.primary[300] || "#7C3AED";

  return (
    <div className="space-y-2">
      {sorted.map((i) => (
        <div key={i.label} className="group">
          <div className="flex justify-between text-xs text-text-tertiary mb-1">
            <span className="truncate max-w-[60%]">{i.label}</span>
            <span className="font-mono text-text-muted">
              {i.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 bg-surface-elevated rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500 will-change-transform"
              style={{
                width: `${(i.value / max) * 100}%`,
                background: barColor,
              }}
            />
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <div className="text-sm text-text-secondary">No data</div>
      )}
    </div>
  );
}

