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

type TxRow = {
  id: number | string;
  date?: string | null;
  type?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  investor_id?: number | null;
  deal_id?: number | null;
  investor_name?: string | null;
  deal_name?: string | null;
  company_name?: string | null;
  display?: string | null;
};

export default function AdminTransactionsPage() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/transactions?limit=200");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setRows(
          data.map((t: any, idx: number) => ({
            id: t.transaction_id ?? t.id ?? idx,
            date: t.transaction_date ?? t.created_at ?? null,
            type: t.transaction_type ?? t.type ?? null,
            amount: t.gross_capital ?? t.amount ?? null,
            currency: t.currency ?? "USD",
            status: t.status ?? null,
            investor_id: t.investor_id ?? null,
            deal_id: t.deal_id ?? null,
            investor_name: t.investorName ?? null,
            deal_name: t.dealName ?? null,
            company_name: t.companyName ?? null,
            display: t.display ?? null,
          }))
        );
      } catch (e: any) {
        setError(e?.message || "Failed to load transactions");
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
          <CardTitle>All Transactions</CardTitle>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">
                        {r.id}
                      </TableCell>
                      <TableCell>
                        {r.date ? new Date(r.date).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {r.type || "-"}
                      </TableCell>
                      <TableCell
                        className={
                          r.type === "capital_call" || r.type === "fee"
                            ? "text-error"
                            : "text-success"
                        }
                      >
                        {typeof r.amount === "number"
                          ? r.amount.toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>{r.currency || "-"}</TableCell>
                      <TableCell>{r.status || "-"}</TableCell>
                      <TableCell>
                        {r.investor_name || "-"}
                        <div className="text-[10px] text-text-muted font-mono">
                          {r.investor_id ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.deal_name || "-"}
                        <div className="text-[10px] text-text-muted font-mono">
                          {r.deal_id ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell>{r.company_name || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No transactions found
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
                <div className="text-sm text-muted-foreground/70 mb-2">
                  Transactions by Type
                </div>
                <BarChart
                  labels={Object.keys(
                    rows.reduce((acc: any, r) => {
                      const k = (r.type || "unknown").toString().toLowerCase();
                      acc[k] = (acc[k] || 0) + 1;
                      return acc;
                    }, {})
                  )}
                  values={
                    Object.values(
                      rows.reduce((acc: any, r) => {
                        const k = (r.type || "unknown")
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
                <div className="text-sm text-muted-foreground/70 mb-2">
                  Top Deals by Amount (sum)
                </div>
                <BarChart
                  labels={Object.keys(
                    rows.reduce((acc: any, r) => {
                      const k = String(r.deal_id || "-");
                      acc[k] = (acc[k] || 0) + Number(r.amount || 0);
                      return acc;
                    }, {})
                  )}
                  values={
                    Object.values(
                      rows.reduce((acc: any, r) => {
                        const k = String(r.deal_id || "-");
                        acc[k] = (acc[k] || 0) + Number(r.amount || 0);
                        return acc;
                      }, {})
                    ) as number[]
                  }
                />
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
