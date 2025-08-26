"use client";

import { useState } from 'react';
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { exportData } from '@/lib/utils/export';

interface ExportButtonProps {
  data: any[];
  type: 'portfolio' | 'transactions' | 'deals' | 'raw';
  filename?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  showFormats?: boolean;
  onExport?: () => void;
}

export function ExportButton({ 
  data, 
  type, 
  filename,
  className = '',
  variant = 'secondary',
  showFormats = true,
  onExport
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setIsExporting(true);
    setShowMenu(false);

    try {
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 100));
      
      exportData(data, type, format);
      
      if (onExport) {
        onExport();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      case 'ghost':
        return 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
      case 'secondary':
      default:
        return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500';
    }
  };

  if (!showFormats) {
    return (
      <button
        onClick={() => handleExport('csv')}
        disabled={isExporting || !data || data.length === 0}
        className={`
          inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${getVariantClasses()}
          ${className}
        `}
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || !data || data.length === 0}
        className={`
          inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${getVariantClasses()}
          ${className}
        `}
      >
        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
        <svg
          className="ml-2 -mr-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => handleExport('csv')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center">
                <span className="mr-3">📊</span>
                Export as CSV
              </div>
              <span className="text-xs text-gray-500 ml-7">
                Opens in Excel
              </span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center">
                <span className="mr-3">📈</span>
                Export as Excel
              </div>
              <span className="text-xs text-gray-500 ml-7">
                Native Excel format
              </span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center">
                <span className="mr-3">🔧</span>
                Export as JSON
              </div>
              <span className="text-xs text-gray-500 ml-7">
                For developers
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

/**
 * Bulk export button for multiple data types
 */
export function BulkExportButton({ 
  portfolio,
  transactions,
  deals,
  className = ''
}: {
  portfolio?: any[];
  transactions?: any[];
  deals?: any[];
  className?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleBulkExport = async () => {
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (portfolio && portfolio.length > 0) {
        exportData(portfolio, 'portfolio', 'csv');
      }
      
      if (transactions && transactions.length > 0) {
        setTimeout(() => exportData(transactions, 'transactions', 'csv'), 500);
      }
      
      if (deals && deals.length > 0) {
        setTimeout(() => exportData(deals, 'deals', 'csv'), 1000);
      }
    } catch (error) {
      console.error('Bulk export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setTimeout(() => setIsExporting(false), 1500);
    }
  };

  return (
    <button
      onClick={handleBulkExport}
      disabled={isExporting}
      className={`
        inline-flex items-center px-6 py-3 text-sm font-medium text-white
        bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg
        hover:from-blue-700 hover:to-blue-800
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 transform hover:scale-105
        shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
      {isExporting ? 'Exporting All...' : 'Export All Data'}
    </button>
  );
}