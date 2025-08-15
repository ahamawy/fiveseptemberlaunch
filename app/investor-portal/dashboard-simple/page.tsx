'use client';

import { useEffect, useState } from 'react';

export default function SimpleDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/investors/1/dashboard')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-8">No data</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Simple Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold">Portfolio</h2>
          <p>Total Value: ${data.portfolio?.totalValue?.toLocaleString()}</p>
          <p>Total Committed: ${data.portfolio?.totalCommitted?.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold">Performance</h2>
          <p>IRR: {data.performance?.irr}%</p>
          <p>MOIC: {data.performance?.moic}x</p>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        {data.recentActivity?.slice(0, 3).map((activity: any, i: number) => (
          <div key={i} className="mb-2">
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-gray-400">${activity.amount?.toLocaleString()}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-400">Active Deals: {data.activeDeals}</p>
      </div>
    </div>
  );
}