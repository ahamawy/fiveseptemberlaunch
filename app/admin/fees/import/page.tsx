"use client";

import { useEffect, useMemo, useState } from 'react';

type PreviewRow = {
  deal_id: number;
  transaction_id: number | null;
  component: string;
  basis: string | null;
  percent: number | null;
  amount: number | null;
  existing_amount: number;
  delta_amount: number;
};

export default function FeesImportPage() {
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [fileText, setFileText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const totalDelta = useMemo(() => preview.reduce((s, r) => s + (Number(r.delta_amount) || 0), 0), [preview]);

  const fetchPreview = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/fees/import');
    const json = await res.json();
    setLoading(false);
    if (json?.data) setPreview(json.data);
  };

  useEffect(() => { fetchPreview(); }, []);

  const onUpload = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/fees/import', {
        method: 'POST',
        headers: { 'content-type': 'text/csv' },
        body: fileText
      });
      const json = await res.json();
      setLoading(false);
      if (json?.success) {
        setMessage(`Imported ${json.inserted} rows.`);
        await fetchPreview();
      } else {
        setMessage(json?.error || 'Import failed');
      }
    } catch (e: any) {
      setLoading(false);
      setMessage(e?.message || 'Upload failed');
    }
  };

  const onApply = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/fees/apply', { method: 'POST' });
      const json = await res.json();
      setLoading(false);
      if (json?.success) {
        setMessage(`Applied: inserted ${json.data?.inserted || 0}, updated ${json.data?.updated || 0}`);
        await fetchPreview();
      } else {
        setMessage(json?.error || 'Apply failed');
      }
    } catch (e: any) {
      setLoading(false);
      setMessage(e?.message || 'Apply failed');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Legacy Fees Import</h1>
      <p className="text-sm text-gray-500">Paste CSV with columns: deal_id, transaction_id, component, basis, percent, amount, notes, source_file</p>
      <textarea
        className="w-full h-40 border rounded p-2 font-mono text-sm"
        placeholder="deal_id,transaction_id,component,basis,percent,amount,notes,source_file\n1,123,STRUCTURING,GROSS,3,,,'import.csv'"
        value={fileText}
        onChange={(e) => setFileText(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={onUpload} disabled={loading} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50">Upload CSV</button>
        <button onClick={fetchPreview} disabled={loading} className="px-3 py-2 rounded bg-gray-200">Refresh Preview</button>
        <button onClick={onApply} disabled={loading} className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50">Apply Import</button>
        <span className="text-sm text-gray-600">{loading ? 'Working...' : message}</span>
      </div>

      <div className="text-sm text-gray-700">Rows: {preview.length} | Total delta: {totalDelta.toFixed(2)}</div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">deal_id</th>
              <th className="text-left p-2">tx_id</th>
              <th className="text-left p-2">component</th>
              <th className="text-left p-2">basis</th>
              <th className="text-right p-2">percent</th>
              <th className="text-right p-2">amount</th>
              <th className="text-right p-2">existing</th>
              <th className="text-right p-2">delta</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.deal_id}</td>
                <td className="p-2">{r.transaction_id ?? ''}</td>
                <td className="p-2">{r.component}</td>
                <td className="p-2">{r.basis ?? ''}</td>
                <td className="p-2 text-right">{r.percent ?? ''}</td>
                <td className="p-2 text-right">{r.amount ?? ''}</td>
                <td className="p-2 text-right">{r.existing_amount}</td>
                <td className="p-2 text-right">{Number(r.delta_amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
