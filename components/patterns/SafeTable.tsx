import React from 'react';

type Col<T> = { key: keyof T; label: string; render?: (row:T)=>React.ReactNode };
export function SafeTable<T extends Record<string, any>>({ rows, cols }:{ rows:T[]; cols: Col<T>[] }){
  if (!rows?.length) return <div data-testid="empty-state" className="text-white/60">No rows.</div>;
  return (
    <div className="rounded-lg border border-white/10 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5">
          <tr>
            {cols.map(c=>(<th key={String(c.key)} className="text-left px-3 py-2 text-white/70">{c.label}</th>))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-t border-white/10 hover:bg-white/5">
              {cols.map(c=>(<td key={String(c.key)} className="px-3 py-2 text-white/80">{c.render? c.render(r): String(r[c.key])}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
