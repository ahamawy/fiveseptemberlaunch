"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { FeeHubBanner } from '@/components/admin/FeeHubBanner';
import { BRAND_CONFIG } from '@/BRANDING/brand.config';
import { formatCurrency } from '@/lib/theme-utils';
import { ArrowUpTrayIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

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
  const [dealId, setDealId] = useState<number>(0);
  const [docText, setDocText] = useState<string>('');

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
        setMessage('Import failed: ' + (json?.error || 'Unknown error'));
      }
    } catch (err) {
      setLoading(false);
      setMessage('Import error: ' + String(err));
    }
  };

  const onApply = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/fees/apply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ preview })
    });
    const json = await res.json();
    setLoading(false);
    if (json?.success) {
      setMessage(`Applied ${json.applied} fee entries.`);
      await fetchPreview();
    } else {
      setMessage('Apply failed: ' + (json?.error || 'Unknown error'));
    }
  };

  const parseAndStage = async () => {
    if (!dealId) { setMessage('Please enter Deal ID'); return; }
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ingest/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ deal_id: Number(dealId), doc_text: docText, create_profile: false })
      });
      const json = await res.json();
      setLoading(false);
      if (json?.success) {
        setMessage(`Staged ${json.staged} rows.`);
        await fetchPreview();
      } else {
        setMessage('Parse/Stage failed: ' + (json?.error || 'Unknown error'));
      }
    } catch (err) {
      setLoading(false);
      setMessage('Parse/Stage error: ' + String(err));
    }
  };

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="p-6 space-y-6">
        <FeeHubBanner />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Legacy Fees Import
          </h1>
          <p className="text-sm text-gray-400">
            Import and reconcile legacy fee data from CSV files
          </p>
        </div>

        {/* Import Section */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Import CSV</h2>
          
          <div className="space-y-4">
            <details className="border border-surface-border rounded p-3 bg-surface/50">
              <summary className="cursor-pointer font-medium text-white">Parse document with AI and stage</summary>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-sm text-gray-300">Deal ID</label>
                  <input className="w-full p-2 rounded bg-surface border border-surface-border text-white" type="number" value={dealId} onChange={(e) => setDealId(Number(e.target.value))} />
                </div>
              </div>
              
              {/* File Upload Option */}
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-3">Option 1: Upload a file (Excel, PDF, Image)</p>
                <FileUploadZone
                  onFileSelect={(file) => setMessage(`Processing ${file.name}...`)}
                  onTextExtracted={(text) => {
                    setDocText(text);
                    setMessage('File processed. Click Parse & Stage to import data.');
                  }}
                  purpose="import"
                />
              </div>
              
              {/* Text Input Option */}
              <div className="mt-4 pt-4 border-t border-surface-border">
                <p className="text-sm text-gray-400 mb-3">Option 2: Paste text or CSV directly</p>
                <textarea 
                  className="w-full p-2 rounded-lg bg-surface border border-surface-border text-white font-mono text-xs" 
                  rows={6} 
                  value={docText} 
                  onChange={(e) => setDocText(e.target.value)} 
                  placeholder="Paste term sheet / subscription text / CSV data here" 
                />
              </div>
              
              <div className="mt-2">
                <button onClick={parseAndStage} className="px-3 py-2 rounded bg-indigo-600 text-white">Parse & Stage</button>
              </div>
            </details>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                CSV Data
              </label>
              <p className="text-xs mb-3 text-gray-500">
                Required columns: deal_id, transaction_id, component, basis, percent, amount, notes, source_file
              </p>
              <textarea
                value={fileText}
                onChange={(e) => setFileText(e.target.value)}
                rows={8}
                className="w-full p-3 rounded-lg bg-surface border border-surface-border text-white focus:ring-2 focus:ring-primary-300"
                placeholder="Paste CSV content here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onUpload}
                disabled={!fileText || loading}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-primary-300 to-secondary-blue text-white hover:opacity-90 disabled:opacity-50"
              >
                <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
                Upload & Preview
              </button>

              <button
                onClick={onApply}
                disabled={preview.length === 0 || loading}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-surface border border-surface-border text-white hover:bg-surface-light disabled:opacity-50"
              >
                Apply Changes
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                message.includes('success') || message.includes('Imported') || message.includes('Applied')
                  ? 'bg-success-500/20 border border-success-500/30 text-success-300'
                  : 'bg-error-500/20 border border-error-500/30 text-error-300'
              }`}>
                {message.includes('success') || message.includes('Imported') || message.includes('Applied') ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5" />
                )}
                <span className="text-sm">{message}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card variant="glass" className="p-4">
            <div className="text-sm text-gray-400">Total Rows</div>
            <div className="text-2xl font-bold mt-1 text-white">
              {preview.length}
            </div>
          </Card>

          <Card variant="glass" className="p-4">
            <div className="text-sm text-gray-400">Total Delta</div>
            <div className={`text-2xl font-bold mt-1 ${
              totalDelta > 0 ? 'text-success-300' : totalDelta < 0 ? 'text-error-300' : 'text-white'
            }`}>
              {formatCurrency(Math.abs(totalDelta))}
              {totalDelta > 0 && ' ↑'}
              {totalDelta < 0 && ' ↓'}
            </div>
          </Card>

          <Card variant="glass" className="p-4">
            <div className="text-sm text-gray-400">Status</div>
            <div className={`text-sm font-medium mt-1 ${
              preview.length > 0 ? 'text-warning-300' : 'text-gray-500'
            }`}>
              {preview.length > 0 ? 'Ready to Apply' : 'No Data'}
            </div>
          </Card>
        </div>

        {/* Preview Table */}
        <Card variant="glass" className="p-6 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Import Preview
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Deal ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">TX ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Component</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Basis</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Percent</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Existing</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Delta</th>
                </tr>
              </thead>
              <tbody>
                {preview.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <span className="text-sm text-gray-500">
                        No preview data available. Upload CSV to see preview.
                      </span>
                    </td>
                  </tr>
                ) : (
                  preview.map((r, i) => (
                    <tr 
                      key={i} 
                      className="border-b border-surface-border hover:bg-surface-light/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-white">
                        {r.deal_id}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {r.transaction_id ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-primary-300/20 text-primary-300">
                          {r.component}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {r.basis ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-white">
                        {r.percent ? `${r.percent}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-white">
                        {r.amount ? formatCurrency(r.amount) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-400">
                        {formatCurrency(r.existing_amount)}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${
                        r.delta_amount > 0 
                          ? 'text-success-300' 
                          : r.delta_amount < 0 
                          ? 'text-error-300' 
                          : 'text-gray-500'
                      }`}>
                        {r.delta_amount > 0 && '+'}
                        {formatCurrency(r.delta_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}