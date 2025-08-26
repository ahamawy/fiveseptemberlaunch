"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function InvestorSelectPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async () => {
    if (!input) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ search: input, limit: "10" });
      const res = await fetch(`/api/investors?${params.toString()}`);
      const json = await res.json();
      const list = Array.isArray(json?.data)
        ? json.data
        : json?.data?.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        // fallback: try direct lookup (public_id or numeric id)
        const r2 = await fetch(`/api/investors/${encodeURIComponent(input)}`);
        const j2 = await r2.json();
        if (r2.ok && (j2?.id || j2?.investor_id)) {
          const id = j2.id ?? j2.investor_id;
          localStorage.setItem("equitie-current-investor-id", String(id));
          window.location.href = `/investor-portal/dashboard?investor=${id}`;
          return;
        }
        setResults([]);
        setError("No matching investors found");
        return;
      }
      setResults(
        list.map((i: any) => ({
          id: i.id ?? i.investor_id,
          name: i.name ?? i.full_name ?? "",
          email: i.email ?? i.primary_email ?? "",
          created_at: i.created_at ?? null,
        }))
      );
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const onPick = (id: number) => {
    localStorage.setItem("equitie-current-investor-id", String(id));
    window.location.href = `/investor-portal/dashboard?investor=${id}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Select Investor</CardTitle>
          <CardDescription>
            Enter an investor ID or public_id to view their portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search by name or email (or paste ID/public_id)"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300/50 text-foreground placeholder-text-muted"
            />
            {error && <div className="text-error-400 text-sm">{error}</div>}
            <div className="flex gap-2">
              <Button onClick={onSearch} disabled={loading} variant="primary">
                {loading ? "Searching…" : "Search"}
              </Button>
              <Button
                onClick={() => {
                  setInput("");
                  setError(null);
                  setResults([]);
                }}
                variant="glass"
              >
                Clear
              </Button>
            </div>
            {results.length > 0 && (
              <div className="mt-4 border border-border rounded-lg divide-y divide-surface-border">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 hover:bg-muted cursor-pointer flex items-center justify-between"
                    onClick={() => onPick(r.id)}
                  >
                    <div>
                      <div className="text-foreground">
                        {r.name || `Investor #${r.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        {r.email || "No email"}
                      </div>
                    </div>
                    <div className="text-xs text-text-muted font-mono">
                      #{r.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
