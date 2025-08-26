/**
 * Export utilities for data export functionality
 * Supports CSV, Excel, and PDF formats
 */

/**
 * Convert JSON data to CSV format
 */
export function jsonToCSV(data: any[], filename?: string): string {
  if (!data || data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle special characters and commas in CSV
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: any[], filename: string = 'export.csv') {
  const csv = jsonToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * Create Excel-compatible format (simplified - actually creates CSV that Excel can open)
 * For true Excel format, we'd need a library like xlsx
 */
export function downloadExcel(data: any[], filename: string = 'export.xlsx') {
  // For now, create a CSV that Excel can open
  // Add BOM for proper UTF-8 handling in Excel
  const BOM = '\uFEFF';
  const csv = BOM + jsonToCSV(data);
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, filename.replace('.xlsx', '.csv'));
}

/**
 * Helper function to trigger file download
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format currency for export
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format percentage for export
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0.00%';
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Format date for export
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Prepare portfolio data for export
 */
export function preparePortfolioExport(data: any[]) {
  return data.map(item => ({
    'Company': item.companyName || item.company_name || '',
    'Sector': item.sector || '',
    'Initial Investment': formatCurrency(item.initialInvestment || item.initial_investment),
    'Current Value': formatCurrency(item.currentValue || item.current_value),
    'MOIC': `${(item.moic || 1).toFixed(2)}x`,
    'IRR': formatPercentage(item.irr || 0),
    'Status': item.status || 'Active',
    'Investment Date': formatDate(item.investmentDate || item.investment_date)
  }));
}

/**
 * Prepare transaction data for export
 */
export function prepareTransactionExport(data: any[]) {
  return data.map(item => ({
    'Transaction ID': item.id || item.transaction_id || '',
    'Date': formatDate(item.date || item.transaction_date),
    'Type': item.type || item.transaction_type || '',
    'Description': item.description || '',
    'Amount': formatCurrency(item.amount),
    'Deal': item.dealName || item.deal_name || '',
    'Status': item.status || 'Completed',
    'Reference': item.reference || ''
  }));
}

/**
 * Prepare deals data for export
 */
export function prepareDealsExport(data: any[]) {
  return data.map(item => ({
    'Deal Name': item.name || item.deal_name || '',
    'Company': item.companyName || item.company_name || '',
    'Type': item.type || item.deal_type || '',
    'Status': item.status || '',
    'Target Size': formatCurrency(item.targetSize || item.target_size),
    'Committed': formatCurrency(item.committed || item.total_committed),
    'Deployed': formatCurrency(item.deployed || item.total_deployed),
    'Current Value': formatCurrency(item.currentValue || item.current_value),
    'MOIC': `${(item.moic || 1).toFixed(2)}x`,
    'Close Date': formatDate(item.closeDate || item.close_date),
    'Exit Date': formatDate(item.exitDate || item.exit_date)
  }));
}

/**
 * Generic export function that handles different data types
 */
export function exportData(
  data: any[],
  type: 'portfolio' | 'transactions' | 'deals' | 'raw',
  format: 'csv' | 'json' | 'excel' = 'csv'
) {
  let exportData = data;
  let baseFilename = 'export';

  // Prepare data based on type
  switch (type) {
    case 'portfolio':
      exportData = preparePortfolioExport(data);
      baseFilename = 'portfolio';
      break;
    case 'transactions':
      exportData = prepareTransactionExport(data);
      baseFilename = 'transactions';
      break;
    case 'deals':
      exportData = prepareDealsExport(data);
      baseFilename = 'deals';
      break;
    case 'raw':
    default:
      // Use raw data as-is
      break;
  }

  // Add timestamp to filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${baseFilename}_${timestamp}`;

  // Export in requested format
  switch (format) {
    case 'json':
      downloadJSON(exportData, `${filename}.json`);
      break;
    case 'excel':
      downloadExcel(exportData, `${filename}.xlsx`);
      break;
    case 'csv':
    default:
      downloadCSV(exportData, `${filename}.csv`);
      break;
  }
}

/**
 * Export all investor data as a comprehensive report
 */
export function exportInvestorReport(
  portfolio: any[],
  transactions: any[],
  deals: any[],
  investorInfo: any
) {
  const report = {
    generatedAt: new Date().toISOString(),
    investor: {
      name: investorInfo?.name || 'Unknown',
      id: investorInfo?.id || '',
      totalValue: formatCurrency(investorInfo?.totalValue),
      totalCommitted: formatCurrency(investorInfo?.totalCommitted),
      irr: formatPercentage(investorInfo?.irr),
      moic: `${(investorInfo?.moic || 1).toFixed(2)}x`
    },
    portfolio: preparePortfolioExport(portfolio),
    transactions: prepareTransactionExport(transactions),
    deals: prepareDealsExport(deals),
    summary: {
      portfolioCount: portfolio.length,
      transactionCount: transactions.length,
      dealsCount: deals.length,
      reportDate: formatDate(new Date())
    }
  };

  const timestamp = new Date().toISOString().split('T')[0];
  downloadJSON(report, `investor_report_${timestamp}.json`);
}