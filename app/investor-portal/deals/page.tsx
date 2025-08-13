'use client';

import { useEffect, useState } from 'react';

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
        <div className="text-gray-500">Loading deals...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading deals data</div>
      </div>
    );
  }

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStageBadge = (stage: string) => {
    const styles: Record<string, string> = {
      sourcing: 'bg-yellow-100 text-yellow-800',
      due_diligence: 'bg-orange-100 text-orange-800',
      closing: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      exited: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[stage] || 'bg-gray-100 text-gray-800';
  };

  const filteredCommitments = filterStage === 'all'
    ? data.commitments
    : data.commitments.filter(c => c.dealStage === filterStage);

  const uniqueStages = Array.from(new Set(data.commitments.map(c => c.dealStage)));

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">Deals & Commitments</h2>
        <p className="mt-2 text-sm text-gray-600">Manage your investment commitments</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Total Committed</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {formatCurrency(data.summary.totalCommitted)}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Capital Called</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {formatCurrency(data.summary.totalCalled)}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Distributed</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {formatCurrency(data.summary.totalDistributed)}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Remaining</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {formatCurrency(data.summary.totalRemaining)}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Active Deals</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {data.summary.activeCommitments}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Avg Called %</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {data.summary.averageCallPercentage.toFixed(1)}%
            </dd>
          </div>
        </div>
      </div>

      {/* Upcoming Capital Calls */}
      {data.upcomingCalls.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Upcoming Capital Calls</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.upcomingCalls.slice(0, 3).map((call, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600">{call.dealName}</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(call.amount, call.currency)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Expected: {call.date ? new Date(call.date).toLocaleDateString() : 'TBD'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deals Filter and List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">All Commitments</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStage('all')}
                className={`px-3 py-1 rounded text-sm ${
                  filterStage === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                All
              </button>
              {uniqueStages.map(stage => (
                <button
                  key={stage}
                  onClick={() => setFilterStage(stage)}
                  className={`px-3 py-1 rounded text-sm capitalize ${
                    filterStage === stage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {stage.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Committed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Called
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Called %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distributed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommitments.map((commitment) => (
                  <tr key={commitment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {commitment.dealName}
                        </div>
                        <div className="text-xs text-gray-500">{commitment.dealCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{commitment.companyName}</div>
                        <div className="text-xs text-gray-500">{commitment.companySector}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageBadge(commitment.dealStage)}`}>
                        {commitment.dealStage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(commitment.committedAmount, commitment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(commitment.capitalCalled, commitment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(commitment.capitalRemaining, commitment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 mr-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${commitment.percentageCalled}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {commitment.percentageCalled.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(commitment.capitalDistributed, commitment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        commitment.status === 'signed' 
                          ? 'bg-green-100 text-green-800'
                          : commitment.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {commitment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}