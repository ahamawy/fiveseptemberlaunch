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

type InvestorRow = {
  id: number;
  name?: string | null;
  email?: string | null;
  type?: string | null;
  kyc_status?: string | null;
  tx_count?: number;
  deal_count?: number;
  created_at?: string | null;
};

export default function AdminInvestorsPage() {
  const [rows, setRows] = useState<InvestorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/investors?limit=200");
        const json = await res.json();
        const data = Array.isArray(json?.data)
          ? json.data
          : json?.data?.data || [];
        setRows(
          data.map((i: any) => ({
            id: i.id ?? i.investor_id,
            name: i.name ?? i.full_name ?? null,
            email: i.email ?? i.primary_email ?? null,
            type: (i.type ?? i.investor_type ?? "").toString().toLowerCase(),
            kyc_status: i.kyc_status ?? null,
            tx_count: i.tx_count ?? 0,
            deal_count: i.deal_count ?? 0,
            created_at: i.created_at ?? null,
          }))
        );
      } catch (e: any) {
        setError(e?.message || "Failed to load investors");
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
          <CardTitle>All Investors</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : error ? (
            <div className="text-error-400">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Tx</TableHead>
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
                      <TableCell className="text-foreground">
                        {r.name || "-"}
                      </TableCell>
                      <TableCell>{r.email || "-"}</TableCell>
                      <TableCell className="capitalize">
                        {r.type || "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {r.kyc_status || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.tx_count ?? 0}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.deal_count ?? 0}
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
                <div className="text-center text-muted-foreground py-8">
                  No investors found
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
              <div className="text-sm text-muted-foreground/70 mb-2">
                Top Investors by Transactions
              </div>
              <BarChart
                labels={rows.map((r) => r.name || String(r.id))}
                values={rows.map((r) => r.tx_count || 0)}
                maxBars={10}
              />
            </div>
          ) : (
            <div className="text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
