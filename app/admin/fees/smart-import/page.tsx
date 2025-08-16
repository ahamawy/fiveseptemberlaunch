"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/theme-utils';
import { 
  ArrowUpTrayIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

interface ImportSession {
  session_id: string;
  headers: string[];
  rows: any[];
  suggested_mapping: Record<string, string>;
  total_rows: number;
}

interface ValidationResult {
  valid: boolean;
  valid_count: number;
  total_count: number;
  errors: any[];
  warnings: any[];
}

export default function SmartImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [session, setSession] = useState<ImportSession | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [savedMappings, setSavedMappings] = useState<any[]>([]);
  
  // Available database fields
  const dbFields = [
    'investor_id', 'investor', 'deal_id', 'deal',
    'gross', 'amount', 'management_fee', 'admin_fee',
    'performance_fee', 'structuring_fee', 'net', 'notes'
  ];
  
  useEffect(() => {
    fetchSavedMappings();
  }, []);
  
  const fetchSavedMappings = async () => {
    try {
      const res = await fetch('/api/admin/fees/mappings');
      const data = await res.json();
      if (data.mappings) setSavedMappings(data.mappings);
    } catch (e) {
      console.error('Failed to fetch mappings:', e);
    }
  };
  
  const handleFileUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const text = await file.text();
      const res = await fetch('/api/admin/fees/smart-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text })
      });
      
      const data = await res.json();
      if (data.success) {
        setSession(data);
        setMapping(data.suggested_mapping || {});
        setMessage(`Uploaded ${data.total_rows} rows. Please map columns.`);
      } else {
        setMessage(`Upload failed: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMappingChange = (csvColumn: string, dbField: string) => {
    setMapping(prev => ({
      ...prev,
      [csvColumn]: dbField
    }));
  };
  
  const validateMapping = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fees/smart-import', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          mapping
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setValidation(data.validation);
        setMessage(`Validated ${data.validation.valid_count}/${data.validation.total_count} rows`);
        
        // Fetch preview
        const previewRes = await fetch(`/api/admin/fees/smart-import?session_id=${session.session_id}`);
        const previewData = await previewRes.json();
        if (previewData.preview) {
          setPreview(previewData.preview);
        }
      }
    } catch (e: any) {
      setMessage(`Validation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const applyImport = async () => {
    if (!session || !validation || !validation.valid) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fees/smart-import/${session.session_id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apply_to_staging: true,
          apply_to_final: false
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully applied ${data.applied_count} rows to staging`);
      } else {
        setMessage(`Apply failed: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Apply error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background-deep">
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Smart Fee Import
          </h1>
          <p className="text-sm text-gray-400">
            Upload CSV files with intelligent column mapping and validation
          </p>
        </div>
        
        {/* Step 1: Upload */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-300/20 flex items-center justify-center text-primary-300 font-bold">
              1
            </div>
            <h2 className="text-lg font-semibold text-white">Upload CSV File</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-surface-border rounded-lg p-8 text-center">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-primary-300 hover:text-primary-200"
              >
                Choose CSV file
              </label>
              {file && (
                <p className="mt-2 text-sm text-gray-400">
                  Selected: {file.name}
                </p>
              )}
            </div>
            
            <button
              onClick={handleFileUpload}
              disabled={!file || loading}
              className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-primary-300 to-secondary-blue text-white hover:opacity-90 disabled:opacity-50"
            >
              <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
              Upload & Parse
            </button>
          </div>
        </Card>
        
        {/* Step 2: Column Mapping */}
        {session && (
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-300/20 flex items-center justify-center text-primary-300 font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-white">Map Columns</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">CSV Columns</h3>
                <div className="space-y-2">
                  {session.headers.map(header => (
                    <div key={header} className="flex items-center gap-3">
                      <span className="text-white flex-1">{header}</span>
                      <ArrowsRightLeftIcon className="w-4 h-4 text-gray-500" />
                      <select
                        value={mapping[header] || ''}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        className="px-3 py-1 rounded bg-surface border border-surface-border text-white"
                      >
                        <option value="">-- Select Field --</option>
                        {dbFields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Preview (First Row)</h3>
                {session.rows[0] && (
                  <div className="bg-surface-light/30 rounded p-3 space-y-1">
                    {Object.entries(session.rows[0]).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={validateMapping}
              disabled={loading || Object.keys(mapping).length === 0}
              className="mt-4 px-6 py-2 rounded-lg font-medium bg-surface border border-surface-border text-white hover:bg-surface-light disabled:opacity-50"
            >
              <CheckCircleIcon className="w-5 h-5 inline mr-2" />
              Validate Mapping
            </button>
          </Card>
        )}
        
        {/* Step 3: Validation Results */}
        {validation && (
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-300/20 flex items-center justify-center text-primary-300 font-bold">
                3
              </div>
              <h2 className="text-lg font-semibold text-white">Validation Results</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Valid Rows</div>
                <div className="text-2xl font-bold text-success-300">
                  {validation.valid_count}
                </div>
              </Card>
              
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Errors</div>
                <div className="text-2xl font-bold text-error-300">
                  {validation.errors.length}
                </div>
              </Card>
              
              <Card variant="glass" className="p-4">
                <div className="text-sm text-gray-400">Warnings</div>
                <div className="text-2xl font-bold text-warning-300">
                  {validation.warnings.length}
                </div>
              </Card>
            </div>
            
            {validation.errors.length > 0 && (
              <div className="mb-4 p-3 bg-error-500/10 border border-error-500/30 rounded">
                <h4 className="text-error-300 font-medium mb-2">Errors:</h4>
                {validation.errors.slice(0, 5).map((err, i) => (
                  <div key={i} className="text-sm text-gray-400">
                    Row {err.row}: {err.errors.join(', ')}
                  </div>
                ))}
              </div>
            )}
            
            {validation.valid && (
              <button
                onClick={applyImport}
                disabled={loading}
                className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-success-500 to-success-600 text-white hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                Apply Import
              </button>
            )}
          </Card>
        )}
        
        {/* Status Messages */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.includes('Success') || message.includes('success')
              ? 'bg-success-500/20 border border-success-500/30 text-success-300'
              : message.includes('fail') || message.includes('error')
              ? 'bg-error-500/20 border border-error-500/30 text-error-300'
              : 'bg-primary-300/20 border border-primary-300/30 text-primary-300'
          }`}>
            {message.includes('Success') || message.includes('success') ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : message.includes('fail') || message.includes('error') ? (
              <ExclamationCircleIcon className="w-5 h-5" />
            ) : (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}