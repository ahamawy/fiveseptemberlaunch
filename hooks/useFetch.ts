import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/utils/improved-logger';

interface UseFetchOptions {
  autoFetch?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { 
    autoFetch = true, 
    retryCount = 0,
    retryDelay = 1000 
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch && !!url);
  const [error, setError] = useState<Error | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const fetchData = useCallback(async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Handle both old and new API response formats
      const actualData = responseData.success !== undefined 
        ? responseData.data 
        : responseData;
      
      setData(actualData);
      setRetryAttempt(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch');
      logger.error(`Fetch failed: ${url}`, error);
      
      setError(error);
      
      // Retry logic
      if (retryAttempt < retryCount) {
        setTimeout(() => {
          setRetryAttempt(prev => prev + 1);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [url, retryAttempt, retryCount, retryDelay]);

  useEffect(() => {
    if (autoFetch && url) {
      fetchData();
    }
  }, [url, fetchData, autoFetch, retryAttempt]);

  const refetch = useCallback(async () => {
    setRetryAttempt(0);
    await fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setRetryAttempt(0);
  }, []);

  return { data, loading, error, refetch, reset };
}

// Specialized version for typed API responses
export function useApiData<T>(
  endpoint: string | null,
  options?: UseFetchOptions
): UseFetchResult<T> {
  const url = endpoint ? `/api/${endpoint}` : null;
  return useFetch<T>(url, options);
}