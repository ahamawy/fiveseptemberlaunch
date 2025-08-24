import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for managing API state (loading, error, data)
 * Replaces duplicated loading/error patterns across components
 */

export interface UseApiStateOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

export interface ApiActions<T> {
  execute: (fetcher: () => Promise<T>) => Promise<T | null>;
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  retry: () => Promise<T | null>;
}

export function useApiState<T = any>(
  options: UseApiStateOptions<T> = {}
): [ApiState<T>, ApiActions<T>] {
  const {
    initialData = null,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastFetcherRef = useRef<(() => Promise<T>) | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(
    async (fetcher: () => Promise<T>): Promise<T | null> => {
      lastFetcherRef.current = fetcher;
      
      // Reset error state
      setError(null);
      setLoading(true);

      let attempts = 0;
      let lastError: Error | null = null;

      while (attempts <= retryCount) {
        try {
          const result = await fetcher();
          
          if (!isMountedRef.current) return null;

          setData(result);
          setLoading(false);
          setError(null);

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (err) {
          lastError = err as Error;
          attempts++;

          if (attempts > retryCount) {
            break;
          }

          // Wait before retrying
          await new Promise(resolve => {
            retryTimeoutRef.current = setTimeout(resolve, retryDelay * attempts);
          });
        }
      }

      // All attempts failed
      if (!isMountedRef.current) return null;

      const errorMessage = lastError?.message || "An error occurred";
      setError(errorMessage);
      setLoading(false);

      if (onError) {
        onError(errorMessage);
      }

      return null;
    },
    [retryCount, retryDelay, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    lastFetcherRef.current = null;
  }, [initialData]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastFetcherRef.current) {
      console.warn("No previous fetch to retry");
      return null;
    }
    return execute(lastFetcherRef.current);
  }, [execute]);

  const state: ApiState<T> = {
    data,
    loading,
    error,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
  };

  const actions: ApiActions<T> = {
    execute,
    setData,
    setLoading,
    setError,
    reset,
    retry,
  };

  return [state, actions];
}

/**
 * Hook for fetching data on mount
 */
export function useFetchOnMount<T>(
  fetcher: () => Promise<T>,
  options: UseApiStateOptions<T> = {}
): ApiState<T> & { refetch: () => Promise<T | null> } {
  const [state, actions] = useApiState<T>(options);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      actions.execute(fetcher);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    refetch: () => actions.execute(fetcher),
  };
}

/**
 * Hook for paginated API calls
 */
export interface PaginatedApiState<T> extends ApiState<T[]> {
  page: number;
  hasMore: boolean;
  totalPages: number;
  totalItems: number;
}

export function usePaginatedApi<T>(
  fetcher: (page: number, limit: number) => Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
  }>,
  limit: number = 10,
  options: UseApiStateOptions<T[]> = {}
): [
  PaginatedApiState<T>,
  {
    nextPage: () => Promise<void>;
    previousPage: () => Promise<void>;
    goToPage: (page: number) => Promise<void>;
    refresh: () => Promise<void>;
  }
] {
  const [state, actions] = useApiState<T[]>(options);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      const result = await actions.execute(async () => {
        const response = await fetcher(pageNum, limit);
        setTotalItems(response.total);
        setPage(response.page);
        return response.data;
      });
      return result;
    },
    [fetcher, limit, actions]
  );

  const nextPage = useCallback(async () => {
    if (page * limit < totalItems) {
      await fetchPage(page + 1);
    }
  }, [page, limit, totalItems, fetchPage]);

  const previousPage = useCallback(async () => {
    if (page > 1) {
      await fetchPage(page - 1);
    }
  }, [page, fetchPage]);

  const goToPage = useCallback(
    async (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= Math.ceil(totalItems / limit)) {
        await fetchPage(pageNum);
      }
    },
    [totalItems, limit, fetchPage]
  );

  const refresh = useCallback(async () => {
    await fetchPage(page);
  }, [page, fetchPage]);

  const paginatedState: PaginatedApiState<T> = {
    ...state,
    data: state.data || [],
    page,
    hasMore: page * limit < totalItems,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
  };

  return [
    paginatedState,
    {
      nextPage,
      previousPage,
      goToPage,
      refresh,
    },
  ];
}