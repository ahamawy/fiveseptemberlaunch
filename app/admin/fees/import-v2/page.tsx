"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { FeeHubBanner } from '@/components/admin/FeeHubBanner';
import { formatCurrency } from '@/lib/theme-utils';
import { 
  ArrowUpTrayIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ValidationError {
  row: number;
  field: string;
  error: string;
}

interface PreviewData {
  deal_id: number;
  transaction_id?: number;
  component: string;
  basis?: string;
  percent?: number;
  amount?: number;
  calculated_amount?: number;
  status: 'valid' | 'warning' | 'error';
  message?: string;
}

export default function FeeImportV2Page() {
  const [csvContent, setCsvContent] = useState('');
  const [preview, setPreview] = useState<PreviewData[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'apply'>('upload');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
      setMessage({ type: 'info', text: 'File loaded. Click Validate to continue.' });
    };
    reader.readAsText(file);
  };

  // Validate CSV
  const validateCSV = async () => {
    if (!csvContent.trim()) {
      setMessage({ type: 'error', text: 'Please upload a CSV file first' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/fees/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csvContent
      });

      const data = await res.json();
      
      if (data.success) {
        setPreview(data.preview);
        setErrors([]);
        setStep('preview');
        setMessage({ 
          type: 'success', 
          text: `Validation successful! ${data.preview.length} rows ready for import.` 
        });
      } else {
        setErrors(data.errors || []);
        setMessage({ type: 'error', text: 'Validation failed. Please fix errors and try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to validate CSV' });
    } finally {
      setLoading(false);
    }
  };

  // Apply fees
  const applyFees = async (dryRun: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fees/apply-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          preview, 
          dry_run: dryRun 
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setStep('apply');
        setMessage({ 
          type: 'success', 
          text: dryRun 
            ? `Dry run complete: Would apply ${data.applied} fees, update ${data.updated} transactions`
            : `Successfully applied ${data.applied} fees and updated ${data.updated} transactions`
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to apply fees' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to apply fees' });
    } finally {
      setLoading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = `deal_id,transaction_id,component,basis,percent,amount,notes,source_file
1001,,MANAGEMENT,GROSS_CAPITAL,2.0,,Annual management fee,legacy_fees.csv
1001,5001,STRUCTURING,GROSS_CAPITAL,1.5,,Deal structuring fee,legacy_fees.csv
1002,5002,PERFORMANCE,PROFIT,20.0,,Performance carry,legacy_fees.csv
1003,,ADMIN,FIXED,,50000,Fixed admin fee,legacy_fees.csv`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fee_import_template.csv';
    a.click();
  };

  // Calculate summary
  const summary = {
    totalRows: preview.length,
    validRows: preview.filter(p => p.status === 'valid').length,
    warningRows: preview.filter(p => p.status === 'warning').length,
    errorRows: preview.filter(p => p.status === 'error').length,
    totalAmount: preview.reduce((sum, p) => sum + (p.calculated_amount || p.amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <FeeHubBanner />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Fee Import System V2
          </h1>
          <p className="text-sm text-gray-400">
            Advanced fee import with validation, preview, and batch processing
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-primary-300' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'upload' ? 'border-primary-300 bg-primary-300/20' : 'border-gray-500'
              }`}>
                1
              </div>
              <span className="font-medium">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-600" />
            <div className={`flex items-center space-x-2 ${step === 'preview' ? 'text-primary-300' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'preview' ? 'border-primary-300 bg-primary-300/20' : 'border-gray-500'
              }`}>
                2
              </div>
              <span className="font-medium">Preview</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-600" />
            <div className={`flex items-center space-x-2 ${step === 'apply' ? 'text-primary-300' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step === 'apply' ? 'border-primary-300 bg-primary-300/20' : 'border-gray-500'
              }`}>
                3
              </div>
              <span className="font-medium">Apply</span>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-success-500/20 border border-success-500/30 text-success-300' :
            message.type === 'error' ? 'bg-error-500/20 border border-error-500/30 text-error-300' :
            'bg-primary-300/20 border border-primary-300/30 text-primary-300'
          }`}>
            {message.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
            {message.type === 'error' && <ExclamationCircleIcon className="w-5 h-5" />}
            {message.type === 'info' && <DocumentTextIcon className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Upload Section */}
        {step === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Upload CSV File</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-400 mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-primary-300 text-white rounded-lg cursor-pointer hover:bg-primary-400 transition-colors"
                  >
                    Choose File
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 text-sm text-primary-300 hover:text-primary-400"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download Template
                  </button>
                  
                  <button
                    onClick={validateCSV}
                    disabled={!csvContent || loading}
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-primary-300 to-secondary-blue text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Validating...' : 'Validate CSV'}
                  </button>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">CSV Format Guide</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium text-gray-300 mb-1">Required Columns:</h3>
                  <ul className="list-disc list-inside text-gray-400 space-y-1">
                    <li><span className="font-mono">deal_id</span> - Deal identifier</li>
                    <li><span className="font-mono">component</span> - Fee type (MANAGEMENT, PERFORMANCE, etc.)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-300 mb-1">Optional Columns:</h3>
                  <ul className="list-disc list-inside text-gray-400 space-y-1">
                    <li><span className="font-mono">transaction_id</span> - Transaction to apply fee to</li>
                    <li><span className="font-mono">basis</span> - Calculation basis (GROSS_CAPITAL, PROFIT, etc.)</li>
                    <li><span className="font-mono">percent</span> - Fee percentage (0-100)</li>
                    <li><span className="font-mono">amount</span> - Fixed fee amount</li>
                    <li><span className="font-mono">notes</span> - Additional notes</li>
                  </ul>
                </div>

                <div className="p-3 bg-warning-500/20 border border-warning-500/30 rounded-lg">
                  <p className="text-warning-300 text-xs">
                    Note: Either percent or amount must be provided for each row
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Preview Section */}
        {step === 'preview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Total Rows</div>
                <div className="text-2xl font-bold mt-1 text-white">{summary.totalRows}</div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Valid</div>
                <div className="text-2xl font-bold mt-1 text-success-300">{summary.validRows}</div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Warnings</div>
                <div className="text-2xl font-bold mt-1 text-warning-300">{summary.warningRows}</div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Errors</div>
                <div className="text-2xl font-bold mt-1 text-error-300">{summary.errorRows}</div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Total Amount</div>
                <div className="text-2xl font-bold mt-1 text-white">{formatCurrency(summary.totalAmount)}</div>
              </Card>
            </div>

            {/* Preview Table */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Import Preview</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => applyFees(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-white hover:bg-surface-light"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Dry Run
                  </button>
                  <button
                    onClick={() => applyFees(false)}
                    disabled={loading || summary.errorRows > 0}
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-primary-300 to-secondary-blue text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Apply Fees
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Deal</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Transaction</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Component</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Basis</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Percent</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-surface-light/50">
                        <td className="py-3 px-4">
                          {row.status === 'valid' && <CheckCircleIcon className="w-4 h-4 text-success-300" />}
                          {row.status === 'warning' && <ExclamationCircleIcon className="w-4 h-4 text-warning-300" />}
                          {row.status === 'error' && <ExclamationCircleIcon className="w-4 h-4 text-error-300" />}
                        </td>
                        <td className="py-3 px-4 text-sm text-white">{row.deal_id}</td>
                        <td className="py-3 px-4 text-sm text-white">{row.transaction_id || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-primary-300/20 text-primary-300">
                            {row.component}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-white">{row.basis || '-'}</td>
                        <td className="py-3 px-4 text-sm text-right text-white">
                          {row.percent ? `${row.percent}%` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-white">
                          {row.amount ? formatCurrency(row.amount) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">{row.message || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Apply Section */}
        {step === 'apply' && (
          <Card variant="glass" className="p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-success-300" />
            <h2 className="text-2xl font-bold mb-2 text-white">Import Complete!</h2>
            <p className="text-gray-400 mb-6">
              Your fees have been successfully imported and applied to the transactions.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setStep('upload');
                  setCsvContent('');
                  setPreview([]);
                  setErrors([]);
                  setMessage(null);
                }}
                className="px-6 py-2 rounded-lg border border-border text-white hover:bg-surface-light"
              >
                Import More
              </button>
              <button
                onClick={() => window.location.href = '/admin/fees/profiles'}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-300 to-secondary-blue text-white"
              >
                View Profiles
              </button>
            </div>
          </Card>
        )}

        {/* Validation Errors */}
        {errors.length > 0 && (
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Validation Errors</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {errors.map((error, idx) => (
                <div key={idx} className="p-3 bg-error-500/20 border border-error-500/30 rounded-lg">
                  <p className="text-sm text-error-300">
                    Row {error.row}, {error.field}: {error.error}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}