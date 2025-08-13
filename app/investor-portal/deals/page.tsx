'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency, formatPercentage } from '@/lib/theme-utils';

interface Commitment {
  id: number;
  dealId: number;
  dealName: string;
  dealCode: string;
  dealStage: string;
  companyName: string;
  companySector: string;
  currency: string;
  committedAmount: number;
  capitalCalled: number;
  capitalDistributed: number;
  capitalRemaining: number;
  percentageCalled: number;
  nextCallAmount: number;
  nextCallDate: string | null;
  status: string;
  dealOpeningDate: string | null;
  dealClosingDate: string | null;
}

interface CommitmentsData {
  commitments: Commitment[];
  summary: {
    totalCommitments: number;
    activeCommitments: number;
    totalCommitted: number;
    totalCalled: number;
    totalDistributed: number;
    totalRemaining: number;
    averageCallPercentage: number;
  };
  upcomingCalls: Array<{
    dealName: string;
    amount: number;
    date: string | null;
    currency: string;
  }>;
}

export default function DealsPage() {
  const [data, setData] = useState<CommitmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<string>('all');

  useEffect(() => {
    fetchCommitmentsData();
  }, []);

  const fetchCommitmentsData = async () => {
    try {
      const response = await fetch('/api/investors/1/commitments');
      const commitmentsData = await response.json();
      setData(commitmentsData);
    } catch (error) {
      console.error('Error fetching commitments data:', error);
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
          Loading deals...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card variant="glass">
        <CardContent className="text-center py-12">
          <div className="text-error">Error loading deals data</div>
        </CardContent>
      </Card>
    );
  }

  const getStageBadge = (stage: string) => {
    const variants: Record<string, 'warning' | 'info' | 'success' | 'error' | 'neutral' | 'primary'> = {
      sourcing: 'warning',
      due_diligence: 'info',
      closing: 'primary',
      active: 'success',
      exited: 'neutral',
      cancelled: 'error',
    };
    return variants[stage] || 'neutral';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      signed: 'success',
      draft: 'warning',
      cancelled: 'error',
    };
    return variants[status] || 'neutral';
  };

  const filteredCommitments = filterStage === 'all'
    ? data.commitments
    : data.commitments.filter(c => c.dealStage === filterStage);

  const uniqueStages = Array.from(new Set(data.commitments.map(c => c.dealStage)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-surface-border">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 to-accent-blue text-gradient">
          Deals & Commitments
        </h1>
        <p className="mt-2 text-text-secondary">
          Manage your investment commitments and track deal progress
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card variant="gradient" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Total Committed</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatCurrency(data.summary.totalCommitted)}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Capital Called</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatCurrency(data.summary.totalCalled)}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Distributed</p>
            <p className="text-2xl font-bold text-accent-green mt-1">
              {formatCurrency(data.summary.totalDistributed)}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Remaining</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatCurrency(data.summary.totalRemaining)}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Active Deals</p>
            <p className="text-2xl font-bold text-primary-300 mt-1">
              {data.summary.activeCommitments}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" hover>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Avg Called %</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {formatPercentage(data.summary.averageCallPercentage)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Capital Calls */}
      {data.upcomingCalls.length > 0 && (
        <Card variant="glass" className="border-accent-yellow/30 bg-accent-yellow/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-6 h-6 text-accent-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming Capital Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.upcomingCalls.slice(0, 3).map((call, idx) => (
                <Card key={idx} variant="glass" hover>
                  <CardContent className="p-4">
                    <p className="text-sm text-text-secondary">{call.dealName}</p>
                    <p className="text-lg font-bold text-text-primary mt-1">
                      {formatCurrency(call.amount, call.currency)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Expected: {call.date ? new Date(call.date).toLocaleDateString() : 'TBD'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deals Filter and List */}
      <Card variant="glass" hover>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Commitments</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStage === 'all' ? 'primary' : 'glass'}
                size="sm"
                onClick={() => setFilterStage('all')}
              >
                All
              </Button>
              {uniqueStages.map(stage => (
                <Button
                  key={stage}
                  variant={filterStage === stage ? 'primary' : 'glass'}
                  size="sm"
                  onClick={() => setFilterStage(stage)}
                  className="capitalize"
                >
                  {stage.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Committed</TableHead>
                  <TableHead>Called</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Called %</TableHead>
                  <TableHead>Distributed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommitments.map((commitment) => (
                  <TableRow key={commitment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-text-primary">
                          {commitment.dealName}
                        </div>
                        <div className="text-xs text-text-muted">{commitment.dealCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-text-primary">{commitment.companyName}</div>
                        <div className="text-xs text-text-muted">{commitment.companySector}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStageBadge(commitment.dealStage)}>
                        {commitment.dealStage.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-primary">
                      {formatCurrency(commitment.committedAmount, commitment.currency)}
                    </TableCell>
                    <TableCell className="text-text-primary">
                      {formatCurrency(commitment.capitalCalled, commitment.currency)}
                    </TableCell>
                    <TableCell className="text-text-primary">
                      {formatCurrency(commitment.capitalRemaining, commitment.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="bg-background-surface rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary-300 h-2 transition-all duration-300"
                              style={{ width: `${commitment.percentageCalled}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-text-primary min-w-[3ch]">
                          {commitment.percentageCalled.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-accent-green">
                      {formatCurrency(commitment.capitalDistributed, commitment.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(commitment.status) as any}>
                        {commitment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCommitments.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-text-primary">No deals found</h3>
              <p className="mt-1 text-sm text-text-muted">
                Try adjusting your filters or check back later for new deals.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}