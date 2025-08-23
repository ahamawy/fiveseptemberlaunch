"use client";
import { useEffect, useState } from "react";

export function HealthBanner() {
  const [ok, setOk] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  async function check() {
    try {
      const res = await fetch("/api/health/supabase", { cache: "no-store" });
      const data = await res.json();
      setOk(Boolean(data?.ok));
      setMessage(data?.error || "");
    } catch (e: any) {
      setOk(false);
      setMessage(e?.message || "Network error");
    }
  }

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  if (ok) return null;

  return (
    <div className="w-full bg-warning-600/20 text-warning-300 border border-warning-600/40 px-4 py-2 text-sm">
      Supabase connectivity degraded. Some data may be stale. {message && <span className="opacity-80">({message})</span>}
    </div>
  );
}


