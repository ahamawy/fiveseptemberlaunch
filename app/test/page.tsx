'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runTests() {
      const results: any = {};
      
      // Test 1: Check localStorage
      try {
        const mockDataSetting = localStorage.getItem('equitie-use-mock-data');
        results.localStorage = {
          'equitie-use-mock-data': mockDataSetting,
        };
      } catch (e) {
        results.localStorage = { error: (e as Error).message };
      }
      
      // Test 2: API Health
      try {
        const healthRes = await fetch('/api/health');
        const health = await healthRes.json();
        results.health = health;
      } catch (e) {
        results.health = { error: (e as Error).message };
      }
      
      // Test 3: Dashboard API
      try {
        const dashRes = await fetch('/api/investors/1/dashboard');
        const dash = await dashRes.json();
        results.dashboard = {
          status: dashRes.status,
          hasData: !!dash.portfolio,
          totalValue: dash.portfolio?.totalValue,
        };
      } catch (e) {
        results.dashboard = { error: (e as Error).message };
      }
      
      // Test 4: Window object
      results.window = {
        location: window.location.href,
        navigator: window.navigator.userAgent.slice(0, 50),
      };
      
      setStatus(results);
      setLoading(false);
    }
    
    runTests();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Running tests...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">System Test Page</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. LocalStorage</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(status.localStorage, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Health Check</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(status.health, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Dashboard API</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(status.dashboard, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Window Info</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(status.window, null, 2)}
          </pre>
        </section>
        
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => {
                localStorage.setItem('equitie-use-mock-data', 'true');
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Set Mock Mode
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('equitie-use-mock-data', 'false');
                window.location.reload();
              }}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Set Supabase Mode
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}