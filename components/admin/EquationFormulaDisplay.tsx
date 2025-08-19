"use client";

import React from "react";

export interface EquationComponentRow {
  component: string;
  basis: "GROSS" | "NET" | "NET_AFTER_PREMIUM" | string;
  rate: number;
  is_percent: boolean;
  precedence: number;
}

export function EquationFormulaDisplay({
  components,
}: {
  components: EquationComponentRow[];
}) {
  if (!components || components.length === 0) {
    return (
      <div className="text-text-secondary text-sm">No equation available.</div>
    );
  }

  const parts = components
    .sort((a, b) => a.precedence - b.precedence)
    .map((c) => {
      const basis = c.basis === "NET_AFTER_PREMIUM" ? "NET-AP" : c.basis;
      const value = c.is_percent
        ? `${Math.round(c.rate * 10000) / 100}%`
        : `$${c.rate}`;
      return (
        <span key={`${c.component}-${c.precedence}`} className="text-text">
          {basis} × {value}
        </span>
      );
    });

  const interleaved: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i > 0)
      interleaved.push(
        <span key={`plus-${i}`} className="mx-1">
          +
        </span>
      );
    interleaved.push(p);
  });

  return <div className="text-sm leading-6">{interleaved}</div>;
}

export default EquationFormulaDisplay;
