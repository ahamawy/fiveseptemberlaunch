'use client';

import { useState, useCallback } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onTextExtracted?: (text: string) => void;
  accept?: string;
  maxSizeMB?: number;
  purpose?: 'profile' | 'import';
}

export function FileUploadZone({
  onFileSelect,
  onTextExtracted,
  accept = '.pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.txt',
  maxSizeMB = 10,
  purpose = 'profile'
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    
    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }
    
    // Validate file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(extension)) {
      setError('Unsupported file type');
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
    
    // Process file if text extraction is needed
    if (onTextExtracted) {
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);
        
        const response = await fetch('/api/admin/ingest/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success && data.mapping) {
          // Convert mapping to readable text for the text area
          const extractedText = formatExtractedData(data.mapping);
          onTextExtracted(extractedText);
        } else {
          setError(data.error || 'Failed to process file');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to process file');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatExtractedData = (mapping: any): string => {
    let text = '';
    
    if (mapping.deal) {
      text += '=== DEAL INFORMATION ===\n';
      if (mapping.deal.deal_id) text += `Deal ID: ${mapping.deal.deal_id}\n`;
      if (mapping.deal.name) text += `Deal Name: ${mapping.deal.name}\n`;
      if (mapping.deal.unit_price_usd) text += `Unit Price: $${mapping.deal.unit_price_usd}\n`;
      if (mapping.deal.premium_percent) text += `Premium: ${mapping.deal.premium_percent}%\n`;
      text += '\n';
    }
    
    if (mapping.partner) {
      text += '=== PARTNER FEES ===\n';
      if (mapping.partner.management_fee_percent) text += `Management Fee: ${mapping.partner.management_fee_percent}%\n`;
      if (mapping.partner.admin_fee_amount) text += `Admin Fee: $${mapping.partner.admin_fee_amount}\n`;
      if (mapping.partner.subscription_fee_percent) text += `Subscription Fee: ${mapping.partner.subscription_fee_percent}%\n`;
      if (mapping.partner.performance_fee_percent) text += `Performance Fee: ${mapping.partner.performance_fee_percent}%\n`;
      text += '\n';
    }
    
    if (mapping.investor_fee_lines && mapping.investor_fee_lines.length > 0) {
      text += '=== INVESTOR DATA ===\n';
      text += 'investor_name,gross_capital,structuring_discount_percent,management_discount_percent,admin_discount_percent\n';
      mapping.investor_fee_lines.forEach((line: any) => {
        text += `${line.investor_name || ''},${line.gross_capital_usd},${line.discount_structuring_pct || 0},${line.discount_management_pct || 0},${line.discount_admin_pct || 0}\n`;
      });
    }
    
    return text;
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const color = {
      pdf: 'text-red-500',
      xlsx: 'text-green-500',
      xls: 'text-green-500',
      csv: 'text-green-500',
      png: 'text-blue-500',
      jpg: 'text-blue-500',
      jpeg: 'text-blue-500',
      txt: 'text-gray-500'
    }[ext || ''] || 'text-gray-500';
    
    return <DocumentIcon className={`w-8 h-8 ${color}`} />;
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-primary-300 bg-primary-300/10' 
            : 'border-surface-border bg-surface/50 hover:border-primary-300/50'
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-3">
          <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400" />
          <div>
            <p className="text-sm text-white font-medium">
              Drop your file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports: PDF, Excel, CSV, Images (PNG/JPG), Text
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max size: {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="bg-surface border border-surface-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-surface-hover rounded"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {isProcessing && (
            <div className="mt-3 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-300 border-t-transparent" />
              <span className="text-sm text-gray-400">Processing file...</span>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-error-500/20 border border-error-500/30 rounded-lg p-3">
          <p className="text-sm text-error-300">{error}</p>
        </div>
      )}

      {/* Format Examples */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-400">Supported formats and examples</summary>
        <div className="mt-2 space-y-1 ml-4">
          <p>• <span className="font-medium">PDF:</span> Term sheets, subscription agreements</p>
          <p>• <span className="font-medium">Excel/CSV:</span> Investor lists, fee calculations</p>
          <p>• <span className="font-medium">Images:</span> Screenshots of deal summaries or tables</p>
          <p>• <span className="font-medium">Text:</span> Plain text documents</p>
        </div>
      </details>
    </div>
  );
}