'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/theme-utils';

interface Transaction {
  id: number;
  publicId: string;
  dealId: number | null;
  dealName: string | null;
  dealCode: string | null;
  companyName: string | null;
  occurredOn: string;
  currency: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  reference: string;
  createdAt: string;
}

interface TransactionsData {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalCapitalCalls: number;
    totalDistributions: number;
    totalFees: number;
    pendingTransactions: number;
    completedTransactions: number;
  };
}

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTransactionsData();
  }, [filterType, filterStatus, currentPage]);

  const fetchTransactionsData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/investors/1/transactions?${params.toString()}`);
      const result = await response.json();
      
      // Transform the API response to the expected structure
      const transactionsData: TransactionsData = {
        transactions: (result.data || []).map((t: any) => ({
          id: t.id,
          publicId: t.public_id || t.publicId,
          dealId: t.deal_id || t.dealId,
          dealName: t.dealName || null,
          dealCode: t.dealCode || null,
          companyName: t.companyName || null,
          occurredOn: t.processed_at || t.created_at || t.occurredOn,
          currency: t.currency || 'USD',
          amount: t.amount || 0,
          type: t.type,
          status: t.status,
          description: t.description || '',
          reference: t.reference || '',
          createdAt: t.created_at || t.createdAt
        })),
        pagination: {
          page: currentPage,
          limit: 10,
          totalCount: result.data?.length || 0,
          totalPages: Math.ceil((result.data?.length || 0) / 10),
          hasNextPage: false,
          hasPreviousPage: currentPage > 1
        },
        summary: {
          totalCapitalCalls: result.data?.filter((t: any) => t.type === 'capital_call')
            .reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
          totalDistributions: result.data?.filter((t: any) => t.type === 'distribution')
            .reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
          totalFees: result.data?.filter((t: any) => t.type === 'fee')
            .reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
          pendingTransactions: result.data?.filter((t: any) => t.status === 'pending').length || 0,
          completedTransactions: result.data?.filter((t: any) => t.status === 'completed').length || 0
        }
      };
      
      setData(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">
          <svg className="animate-spin h-8 w-8 text-primary-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading transactions...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card variant="glass">
        <CardContent className="text-center py-12">
          <div className="text-error">Error loading transactions data</div>
        </CardContent>
      </Card>
    );
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'error' | 'success' | 'warning' | 'info' | 'default'> = {
      capital_call: 'error',
      distribution: 'success',
      fee: 'warning',
      refund: 'info',
      adjustment: 'default',
    };
    return variants[type] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      pending: 'warning',
      completed: 'success',
      failed: 'error',
      cancelled: 'default',
    };
    return variants[status] || 'default';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'capital_call':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        );
      case 'distribution':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        );
      case 'fee':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'refund':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      case 'adjustment':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-surface-border">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
          Transaction History
        </h1>
        <p className="mt-2 text-text-secondary">
          View all your investment transactions and cash flows
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Capital Calls</p>
            <p className="text-2xl font-bold text-error mt-1">
              -{formatCurrency(data.summary.totalCapitalCalls)}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Distributions</p>
            <p className="text-2xl font-bold text-success mt-1">
              +{formatCurrency(data.summary.totalDistributions)}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Total Fees</p>
            <p className="text-2xl font-bold text-warning mt-1">
              -{formatCurrency(data.summary.totalFees)}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Pending</p>
            <p className="text-2xl font-bold text-accent-yellow mt-1">
              {data.summary.pendingTransactions}
            </p>
          </CardContent>
        </Card>

        <Card variant="gradient" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Completed</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {data.summary.completedTransactions}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Transactions Table */}
      <Card variant="glass" hover>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full px-3 py-2 bg-background-surface border border-surface-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 text-text-primary"
              >
                <option value="">All Types</option>
                <option value="capital_call">Capital Call</option>
                <option value="distribution">Distribution</option>
                <option value="fee">Fee</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full px-3 py-2 bg-background-surface border border-surface-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 text-text-primary"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-text-primary">
                      {formatDate(transaction.occurredOn)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadge(transaction.type)}>
                        <span className="mr-1 inline-flex">{getTypeIcon(transaction.type)}</span>
                        {transaction.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-primary">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {transaction.dealName ? (
                        <div>
                          <div className="text-sm text-text-primary">{transaction.dealName}</div>
                          <div className="text-xs text-text-muted">{transaction.companyName}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={transaction.type === 'capital_call' || transaction.type === 'fee' ? 'text-error' : 'text-success'}>
                        {transaction.type === 'capital_call' || transaction.type === 'fee' ? '-' : '+'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-secondary text-sm">
                      {transaction.reference}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.transactions.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-text-primary">No transactions found</h3>
              <p className="mt-1 text-sm text-text-muted">
                {filterType || filterStatus
                  ? 'Try adjusting your filters'
                  : 'Transactions will appear here when available'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {data.transactions.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalCount} total transactions)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!data.pagination.hasPreviousPage}
                  variant={data.pagination.hasPreviousPage ? 'glass' : 'ghost'}
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!data.pagination.hasNextPage}
                  variant={data.pagination.hasNextPage ? 'primary' : 'ghost'}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}