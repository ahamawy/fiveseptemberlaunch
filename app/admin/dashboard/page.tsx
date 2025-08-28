"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type Metrics = {
  totals: {
    deals: number;
    investors: number;
    transactions: number;
    total_gross_capital: number;
    total_net_capital: number;
    aum: number;
    moic: number;
  };
  capital_by_deal: Array<{
    deal_id: number;
    deal_name: string | null;
    currency: string | null;
    gross_capital: number;
    net_capital: number;
  }>;
};

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        {sub && <div className="text-xs text-muted-foreground/70 mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/metrics");
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || "Failed to load");
        setData(json.data);
      } catch (e: any) {
        setError(e?.message || "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-error-400">{error}</div>;
  if (!data) return null;

  const t = data.totals;
  const fmt = (n: number) => (typeof n === "number" ? n.toLocaleString() : "-");
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="AUM"
          value={`$${fmt(t.aum)}`}
          sub="Approximate current value"
        />
        <Stat
          label="Total Net Capital"
          value={`$${fmt(t.total_net_capital)}`}
        />
        <Stat label="MOIC" value={t.moic.toFixed(2)} />
        <Stat
          label="Counts"
          value={`${fmt(t.deals)} deals`}
          sub={`${fmt(t.investors)} investors · ${fmt(t.transactions)} tx`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capital by Deal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="py-2">Deal</th>
                  <th className="py-2">Gross Capital</th>
                  <th className="py-2">Net Capital</th>
                </tr>
              </thead>
              <tbody>
                {data.capital_by_deal.map((d) => (
                  <tr
                    key={d.deal_id}
                    className="border-b border-border/60"
                  >
                    <td className="py-2">
                      <div className="text-foreground">
                        {d.deal_name || `Deal #${d.deal_id}`}
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        {d.currency || "USD"}
                      </div>
                    </td>
                    <td className="py-2 font-mono">${fmt(d.gross_capital)}</td>
                    <td className="py-2 font-mono">${fmt(d.net_capital)}</td>
                  </tr>
                ))}
                {data.capital_by_deal.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




