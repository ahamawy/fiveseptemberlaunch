'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'network' | 'performance'>('logs');
  const [networkRequests, setNetworkRequests] = useState<any[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Get initial theme
    const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    setTheme(currentTheme);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('equitie-theme', newTheme);
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Intercept fetch to log network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const [url, options] = args;
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        setNetworkRequests(prev => [...prev.slice(-49), {
          url: url.toString(),
          method: options?.method || 'GET',
          status: response.status,
          duration,
          timestamp: new Date().toISOString(),
        }]);
        
        return response;
      } catch (error) {
        setNetworkRequests(prev => [...prev.slice(-49), {
          url: url.toString(),
          method: options?.method || 'GET',
          status: 'ERROR',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        }]);
        throw error;
      }
    };

    // Update logs periodically
    const interval = setInterval(() => {
      setLogs(logger.getRecentLogs(50));
    }, 1000);

    return () => {
      window.fetch = originalFetch;
      clearInterval(interval);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-20 z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono"
      >
        {theme === 'dark' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
      
      {/* Dev Tools Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono"
      >
        {isOpen ? (
          <>
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </>
        ) : (
          <>
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            DevTools
          </>
        )}
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl" style={{ height: '300px' }}>
          <div className="flex h-full">
            {/* Tabs */}
            <div className="w-48 bg-gray-100 border-r border-gray-200">
              <div className="p-2 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-600">DEV TOOLS</h3>
              </div>
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full text-left px-4 py-2 text-sm ${activeTab === 'logs' ? 'bg-white border-l-2 border-blue-500' : ''}`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Logs
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`w-full text-left px-4 py-2 text-sm ${activeTab === 'network' ? 'bg-white border-l-2 border-blue-500' : ''}`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Network
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`w-full text-left px-4 py-2 text-sm ${activeTab === 'performance' ? 'bg-white border-l-2 border-blue-500' : ''}`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Performance
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'logs' && (
                <div className="space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No logs yet...</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className={`text-xs font-mono p-1 rounded ${
                        log.level === 'error' ? 'bg-red-50 text-red-700' :
                        log.level === 'warn' ? 'bg-yellow-50 text-yellow-700' :
                        log.level === 'info' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        <span className="font-semibold">[{log.level.toUpperCase()}]</span> {log.message}
                        {log.context && (
                          <pre className="mt-1 text-xs opacity-75">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-1">
                  {networkRequests.length === 0 ? (
                    <p className="text-gray-500 text-sm">No network requests yet...</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">Method</th>
                          <th className="text-left p-1">URL</th>
                          <th className="text-left p-1">Status</th>
                          <th className="text-left p-1">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {networkRequests.map((req, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-1 font-mono">{req.method}</td>
                            <td className="p-1 font-mono truncate max-w-xs">{req.url}</td>
                            <td className={`p-1 font-mono ${
                              req.status === 'ERROR' ? 'text-red-600' :
                              req.status >= 400 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {req.status}
                            </td>
                            <td className="p-1 font-mono">{req.duration ? `${req.duration}ms` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <h4 className="text-sm font-semibold mb-2">Page Performance</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">First Paint:</span>
                        <span className="ml-2 font-mono">
                          {typeof window !== 'undefined' && 
                            (performance.getEntriesByType('paint')[0] as any)?.startTime?.toFixed(0) || 'N/A'
                          }ms
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">DOM Ready:</span>
                        <span className="ml-2 font-mono">
                          {typeof window !== 'undefined' && 
                            (performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart) || 'N/A'
                          }ms
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <h4 className="text-sm font-semibold mb-2">Memory Usage</h4>
                    <div className="text-xs">
                      {typeof window !== 'undefined' && (performance as any).memory ? (
                        <>
                          <div>Used: {((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2)} MB</div>
                          <div>Total: {((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2)} MB</div>
                        </>
                      ) : (
                        <span className="text-gray-500">Memory API not available</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}