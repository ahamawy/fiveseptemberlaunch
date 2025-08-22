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

type CompanyRow = {
  id: number;
  name?: string | null;
  type?: string | null;
  sector?: string | null;
  website?: string | null;
  logo_url?: string | null;
  background_url?: string | null;
  deal_count?: number;
  created_at?: string | null;
};

export default function AdminCompaniesPage() {
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/companies");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setRows(
          data.map((c: any) => ({
            id: c.company_id ?? c.id,
            name: c.company_name ?? c.name ?? null,
            type: c.company_type ?? c.type ?? null,
            sector: c.company_sector ?? c.sector ?? null,
            website: c.company_website ?? c.website ?? null,
            logo_url: c.logo_url ?? null,
            background_url: c.background_url ?? null,
            deal_count: c.deal_count ?? 0,
            created_at: c.created_at ?? null,
          }))
        );
      } catch (e: any) {
        setError(e?.message || "Failed to load companies");
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
          <CardTitle>All Companies</CardTitle>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">
                        {r.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.deal_count}
                      </TableCell>
                      <TableCell className="text-text-primary">
                        <div className="flex items-center gap-3">
                          {r.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.logo_url}
                              alt="logo"
                              className="w-8 h-8 rounded object-cover border border-surface-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-surface-elevated border border-surface-border" />
                          )}
                          <div>{r.name || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {r.type || "-"}
                      </TableCell>
                      <TableCell>{r.sector || "-"}</TableCell>
                      <TableCell>
                        {r.website ? (
                          <a
                            href={r.website}
                            className="text-primary-300 underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {r.website}
                          </a>
                        ) : (
                          "-"
                        )}
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
                  No companies found
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
            <div>
              <div className="text-sm text-text-tertiary mb-2">
                Top Companies by Deals
              </div>
              <BarChart
                labels={rows.map((r) => r.name || String(r.id))}
                values={rows.map((r) => r.deal_count || 0)}
                maxBars={10}
              />
            </div>
          ) : (
            <div className="text-text-secondary">No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
