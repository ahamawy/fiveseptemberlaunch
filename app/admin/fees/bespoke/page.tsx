"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/theme-utils';
import { 
  ArrowUpTrayIcon, 
  CalculatorIcon,
  CheckCircleIcon, 
  ExclamationCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface FeeProfile {
  id: number;
  name: string;
  kind: string;
  config: any;
}

interface FeeCalculation {
  investor_id: number;
  deal_id: number;
  gross_capital: number;
  fees: {
    management: number;
    admin: number;
    performance: number;
    structuring: number;
    premium: number;
  };
  discount_percent: number;
  discount_amount: number;
  net_transfer: number;
}

export default function BespokeFeeImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [profiles, setProfiles] = useState<FeeProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [results, setResults] = useState<FeeCalculation[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [applyDirectly, setApplyDirectly] = useState(false);
  
  // Sample CSV template
  const sampleCSV = `Investor Name,Deal ID,Gross Capital,Management Fee,Admin Fee,Performance Fee,Structuring Fee,Premium,Discount %,Net Transfer
John Doe,28,1600000,32000,8000,0,16000,64000,10,1424000
Jane Smith,28,800000,16000,4000,0,8000,32000,5,757000
Investment Fund A,28,352000,7040,1760,0,3520,14080,0,325600`;
  
  useEffect(() => {
    fetchProfiles();
  }, []);
  
  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/admin/fees/bespoke-import');
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
        // Auto-select LEGACY profile if exists
        const legacy = data.profiles.find((p: FeeProfile) => p.name === 'LEGACY_WATERFALL');
        if (legacy) setSelectedProfile(legacy.id);
      }
    } catch (e) {
      console.error('Failed to fetch profiles:', e);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      file.text().then(text => setCsvText(text));
    }
  };
  
  const processFees = async () => {
    if (!csvText && !file) {
      setMessage('Please upload a CSV file or paste CSV data');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/admin/fees/bespoke-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv: csvText || await file?.text(),
          profile_id: selectedProfile,
          apply_directly: applyDirectly
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResults(data.results || []);
        setTotals(data.totals);
        setMessage(
          applyDirectly 
            ? `Successfully processed and applied ${data.totals.successful} fee entries`
            : `Preview: ${data.totals.successful} entries ready to apply`
        );
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Processing error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFees = async () => {
    if (!results.length) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fees/bespoke-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv: csvText || await file?.text(),
          profile_id: selectedProfile,
          apply_directly: true
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully applied ${data.totals.successful} fee entries to the database`);
      }
    } catch (e: any) {
      setMessage(`Apply error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Bespoke Fee Import
          </h1>
          <p className="text-sm text-gray-400">
            Import fees with automatic calculation based on deal profiles
          </p>
        </div>
        
        {/* Configuration */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <CalculatorIcon className="w-5 h-5" />
            Fee Configuration
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Fee Profile
              </label>
              <select
                value={selectedProfile || ''}
                onChange={(e) => setSelectedProfile(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-surface border border-border text-white"
              >
                <option value="">-- Select Profile --</option>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.kind})
                  </option>
                ))}
              </select>
              {selectedProfile && (
                <div className="mt-2 p-2 bg-surface-light/30 rounded text-xs text-gray-400">
                  {profiles.find(p => p.id === selectedProfile)?.config && (
                    <>
                      Mgmt: {(profiles.find(p => p.id === selectedProfile)?.config.management_fee * 100).toFixed(1)}% | 
                      Admin: {(profiles.find(p => p.id === selectedProfile)?.config.admin_fee * 100).toFixed(1)}% | 
                      Perf: {(profiles.find(p => p.id === selectedProfile)?.config.performance_fee * 100).toFixed(0)}%
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Import Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={applyDirectly}
                    onChange={(e) => setApplyDirectly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-white">Apply directly to database</span>
                </label>
                <p className="text-xs text-gray-500">
                  {applyDirectly 
                    ? 'Fees will be applied immediately to staging and final tables'
                    : 'Preview mode - review before applying'}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* CSV Input */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            CSV Data Input
          </h2>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <ArrowUpTrayIcon className="w-8 h-8 mb-2 text-primary-300" />
                <span className="text-primary-300 hover:text-primary-200">
                  Click to upload CSV
                </span>
                {file && (
                  <span className="mt-2 text-sm text-gray-400">
                    Selected: {file.name}
                  </span>
                )}
              </label>
            </div>
            
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Or paste CSV data directly:
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={8}
                className="w-full p-3 rounded-lg bg-surface border border-border text-white font-mono text-sm"
                placeholder={sampleCSV}
              />
            </div>
            
            {/* Sample Template */}
            <div className="p-3 bg-surface-light/30 rounded">
              <p className="text-xs text-gray-400 mb-2">
                Expected columns: Investor Name, Deal ID, Gross Capital, Management Fee, Admin Fee, 
                Performance Fee, Structuring Fee, Premium, Discount %, Net Transfer
              </p>
              <button
                onClick={() => setCsvText(sampleCSV)}
                className="text-xs text-primary-300 hover:text-primary-200"
              >
                Use sample template
              </button>
            </div>
          </div>
          
          <button
            onClick={processFees}
            disabled={loading || (!csvText && !file)}
            className="mt-4 px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-primary-300 to-secondary-blue text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : applyDirectly ? 'Import & Apply' : 'Preview Import'}
          </button>
        </Card>
        
        {/* Results Summary */}
        {totals && (
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Import Summary
            </h2>
            
            <div className="grid grid-cols-4 gap-4">
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <UserGroupIcon className="w-4 h-4 text-primary-300" />
                  <span className="text-sm text-gray-400">Total Rows</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {totals.successful}
                </div>
              </Card>
              
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CurrencyDollarIcon className="w-4 h-4 text-success-300" />
                  <span className="text-sm text-gray-400">Gross Capital</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(totals.total_gross)}
                </div>
              </Card>
              
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalculatorIcon className="w-4 h-4 text-warning-300" />
                  <span className="text-sm text-gray-400">Total Fees</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(totals.total_fees)}
                </div>
              </Card>
              
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleIcon className="w-4 h-4 text-primary-300" />
                  <span className="text-sm text-gray-400">Net Transfer</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(totals.total_net)}
                </div>
              </Card>
            </div>
          </Card>
        )}
        
        {/* Detailed Results */}
        {results.length > 0 && (
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Fee Calculations ({results.length} entries)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-400">Investor</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-400">Deal</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Gross</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Mgmt</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Admin</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Perf</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Struct</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Premium</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Disc %</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 20).map((result, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-surface-light/30">
                      <td className="py-2 px-3 text-sm text-white">{result.investor_id}</td>
                      <td className="py-2 px-3 text-sm text-white">{result.deal_id}</td>
                      <td className="py-2 px-3 text-sm text-right text-white">
                        {formatCurrency(result.gross_capital)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-gray-300">
                        {formatCurrency(result.fees.management)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-gray-300">
                        {formatCurrency(result.fees.admin)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-gray-300">
                        {formatCurrency(result.fees.performance)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-gray-300">
                        {formatCurrency(result.fees.structuring)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-gray-300">
                        {formatCurrency(result.fees.premium)}
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-warning-300">
                        {result.discount_percent}%
                      </td>
                      <td className="py-2 px-3 text-sm text-right font-medium text-success-300">
                        {formatCurrency(result.net_transfer)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {!applyDirectly && results.length > 0 && (
              <button
                onClick={applyFees}
                disabled={loading}
                className="mt-4 px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-success-500 to-success-600 text-white hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                Apply Fees to Database
              </button>
            )}
          </Card>
        )}
        
        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.includes('Success') || message.includes('success')
              ? 'bg-success-500/20 border border-success-500/30 text-success-300'
              : message.includes('Error') || message.includes('error')
              ? 'bg-error-500/20 border border-error-500/30 text-error-300'
              : 'bg-primary-300/20 border border-primary-300/30 text-primary-300'
          }`}>
            {message.includes('Success') || message.includes('success') ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : message.includes('Error') || message.includes('error') ? (
              <ExclamationCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}