"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FeeHubBanner } from '@/components/admin/FeeHubBanner';
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import EquationFormulaDisplay from "@/components/admin/EquationFormulaDisplay";

type Deal = { id: number; name?: string };

export default function DealEquationsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    (async () => {
      try {
        // First, fetch minimal page to compute total and 3-way split
        const metaRes = await fetch("/api/deals?limit=1");
        const metaJson = await metaRes.json();
        const totalCount = metaJson?.metadata?.pagination?.total ?? 0;
        const computedPerPage = totalCount > 0 ? Math.ceil(totalCount / 3) : 10;
        setPerPage(computedPerPage);
        setTotal(totalCount);
        setTotalPages(Math.max(1, Math.ceil(totalCount / computedPerPage)));

        const res = await fetch(
          `/api/deals?page=1&limit=${computedPerPage}&sortBy=name&sortOrder=asc`
        );
        const json = await res.json();
        const rows = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.deals)
          ? json.deals
          : [];
        const mapped = rows.map((d: any) => ({
          id: d.id ?? d.deal_id,
          name: d.name ?? d.deal_name ?? `Deal #${d.id ?? d.deal_id}`,
        }));
        setDeals(mapped);
      } catch (e) {
        setError("Failed to load deals");
      }
    })();
  }, []);

  const load = async () => {
    if (!selectedDealId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/equations/${selectedDealId}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else setError(json?.error || "Failed to load");
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const changePage = async (newPage: number) => {
    setPage(newPage);
    setError(null);
    try {
      const res = await fetch(
        `/api/deals?page=${newPage}&limit=${perPage}&sortBy=name&sortOrder=asc`
      );
      const json = await res.json();
      const rows = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.deals)
        ? json.deals
        : [];
      const mapped = rows.map((d: any) => ({
        id: d.id ?? d.deal_id,
        name: d.name ?? d.deal_name ?? `Deal #${d.id ?? d.deal_id}`,
      }));
      setDeals(mapped);
      setSelectedDealId(null);
      setData(null);
    } catch (e) {
      setError("Failed to load page");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDealId]);

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <FeeHubBanner />
        <h1 className="text-3xl font-bold">Deal Equations Viewer</h1>

        <Card>
          <CardHeader>
            <CardTitle>Select Deal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <select
                name="dealSelector"
                className="bg-surface border border-surface-border rounded-md px-3 py-2 text-sm"
                value={selectedDealId ?? ""}
                onChange={(e) =>
                  setSelectedDealId(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
              >
                <option value="">Select a deal...</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name ? `${d.name} (#${d.id})` : `Deal #${d.id}`}
                  </option>
                ))}
              </select>
              <Button onClick={load} loading={loading}>
                Refresh
              </Button>
              {error && (
                <span className="text-error-light text-sm">{error}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm text-text-secondary">
              <span>
                Page {page} of {totalPages} • {total} deals • {perPage} per page
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                >
                  Prev
                </Button>
                {[...Array(Math.min(3, totalPages)).keys()].map((i) => {
                  const p = i + 1;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => changePage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
                {totalPages > 3 && <span className="px-2">…</span>}
                {totalPages > 3 && (
                  <Button
                    variant={totalPages === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => changePage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => changePage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Equation (fee_schedule_config)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <EquationFormulaDisplay components={data?.schedule || []} />
              </div>
              <Table data-testid="equation-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Precedence</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead>Rate/Amount</TableHead>
                    <TableHead>Is %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.schedule?.map((row: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{row.precedence}</TableCell>
                      <TableCell>{row.component}</TableCell>
                      <TableCell>{row.basis}</TableCell>
                      <TableCell>{row.rate}</TableCell>
                      <TableCell>{String(row.is_percent)}</TableCell>
                    </TableRow>
                  ))}
                  {(!data?.schedule || data.schedule.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-text-secondary">
                        No schedule found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Transaction Output</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.latestTransaction ? (
                <div className="space-y-3" data-testid="calculation-summary">
                  <div className="text-sm text-text-secondary">
                    Transaction #{data.latestTransaction.transaction_id}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Gross Capital:</div>
                    <div className="font-mono">
                      {data.latestTransaction.gross_capital}
                    </div>
                    <div>Unit Price</div>
                    <div className="font-mono">
                      {data.latestTransaction.unit_price}
                    </div>
                  </div>
                  {data.calculation ? (
                    <div className="mt-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Pre-Discount</div>
                        <div className="font-mono">
                          {data.calculation.transferPreDiscount}
                        </div>
                        <div>Total Discounts</div>
                        <div className="font-mono">
                          {data.calculation.totalDiscounts}
                        </div>
                        <div>Total Fees:</div>
                        <div className="font-mono">
                          {data.calculation.transferPostDiscount}
                        </div>
                        <div>Net Capital:</div>
                        <div className="font-mono">
                          {data.calculation.netCapital ||
                            data.latestTransaction.gross_capital -
                              data.calculation.transferPostDiscount}
                        </div>
                        <div>Units:</div>
                        <div className="font-mono">
                          {data.calculation.units}
                        </div>
                        <div>Valid</div>
                        <div className="font-mono">
                          {String(data.calculation.validation?.valid)}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">
                          Applied Fees
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Component</TableHead>
                              <TableHead>Basis</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.calculation.state?.appliedFees?.map(
                              (f: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell>{i + 1}</TableCell>
                                  <TableCell>{f.component}</TableCell>
                                  <TableCell>{f.basis}</TableCell>
                                  <TableCell className="font-mono">
                                    {f.amount}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-3" data-testid="stored-fees">
                        <div className="text-sm font-medium mb-2">
                          Stored fee_application_record
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Component</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Percent</TableHead>
                              <TableHead>Applied</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.stored?.map((r: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell>{r.component}</TableCell>
                                <TableCell className="font-mono">
                                  {r.amount}
                                </TableCell>
                                <TableCell className="font-mono">
                                  {r.percent}
                                </TableCell>
                                <TableCell>
                                  {r.applied ? "Yes" : "No"}
                                </TableCell>
                              </TableRow>
                            ))}
                            {(!data.stored || data.stored.length === 0) && (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-text-secondary"
                                >
                                  No stored rows.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-text-secondary text-sm">
                      No calculation available.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-text-secondary text-sm">
                  No recent transaction found for this deal.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
