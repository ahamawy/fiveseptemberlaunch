"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { BarChart } from "@/components/ui/BarChart";

type DealRow = {
  id: number;
  name: string;
  stage?: string;
  type?: string;
  company_id?: number | null;
  company_name?: string | null;
  company_description?: string | null;
  company_logo_url?: string | null;
  company_background_url?: string | null;
  currency?: string;
  opening_date?: string | null;
  created_at?: string | null;
  investor_count?: number;
  tx_count?: number;
};

export default function AdminDealsPage() {
  const [rows, setRows] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/deals?limit=200");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setRows(
          data.map((d: any) => ({
            id: d.id ?? d.deal_id,
            name: d.name ?? d.deal_name,
            stage: d.stage ?? d.deal_status,
            type: d.type ?? d.deal_type,
            company_id: d.company_id ?? d.underlying_company_id ?? null,
            company_name: d.company_name ?? null,
            company_description: d.company_description ?? null,
            company_logo_url: d.company_logo_url ?? null,
            company_background_url: d.company_background_url ?? null,
            currency: d.currency ?? d.deal_currency,
            opening_date: d.opening_date ?? d.deal_date ?? null,
            created_at: d.created_at ?? null,
            investor_count: d.investor_count ?? 0,
            tx_count: d.tx_count ?? 0,
          }))
        );
      } catch (e: any) {
        setError(e?.message || "Failed to load deals");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-text-secondary">Loading…</div>
          ) : error ? (
            <div className="text-error-400">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Investors</TableHead>
                    <TableHead>Tx</TableHead>
                    <TableHead>Opening</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">
                        {r.id}
                      </TableCell>
                      <TableCell className="text-text-primary">
                        <div className="flex items-center gap-3">
                          {r.company_logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.company_logo_url}
                              alt="logo"
                              className="w-7 h-7 rounded object-cover border border-surface-border"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-surface-elevated border border-surface-border" />
                          )}
                          <div>{r.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {r.stage || "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {r.type || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {/** Logo pulled via Companies API mapping is not available here; keep text fallback. */}
                          <div>
                            <div className="text-text-primary">
                              {r.company_name || "-"}
                            </div>
                            <div className="text-[10px] text-text-muted font-mono">
                              {r.company_id ?? "-"}
                            </div>
                            {r.company_description && (
                              <div className="text-xs text-text-muted mt-1 line-clamp-2">
                                {r.company_description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{r.currency || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.investor_count ?? 0}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.tx_count ?? 0}
                      </TableCell>
                      <TableCell>
                        {r.opening_date
                          ? new Date(r.opening_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length === 0 && (
                <div className="text-center text-text-secondary py-8">
                  No deals found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-text-tertiary mb-2">
                  Deals by Stage
                </div>
                <BarChart
                  labels={Object.keys(
                    rows.reduce((acc: any, r) => {
                      const k = (r.stage || "unknown").toString().toLowerCase();
                      acc[k] = (acc[k] || 0) + 1;
                      return acc;
                    }, {})
                  )}
                  values={
                    Object.values(
                      rows.reduce((acc: any, r) => {
                        const k = (r.stage || "unknown")
                          .toString()
                          .toLowerCase();
                        acc[k] = (acc[k] || 0) + 1;
                        return acc;
                      }, {})
                    ) as number[]
                  }
                />
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-2">
                  Deals by Currency
                </div>
                <BarChart
                  labels={Object.keys(
                    rows.reduce((acc: any, r) => {
                      const k = (r as any).currency || "USD";
                      acc[k] = (acc[k] || 0) + 1;
                      return acc;
                    }, {})
                  )}
                  values={
                    Object.values(
                      rows.reduce((acc: any, r) => {
                        const k = (r as any).currency || "USD";
                        acc[k] = (acc[k] || 0) + 1;
                        return acc;
                      }, {})
                    ) as number[]
                  }
                />
              </div>
            </div>
          ) : (
            <div className="text-text-secondary">No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
