import { DefaultOptions, QueryClient } from '@tanstack/react-query';

/**
 * React Query configuration following bulletproof-react patterns
 */

const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: 1 minute
    staleTime: 1000 * 60,
    // Don't refetch on window focus by default
    refetchOnWindowFocus: false,
    // Retry failed requests once
    retry: 1,
    // Retry delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Don't retry mutations by default
    retry: false,
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

// Singleton query client for client-side usage
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return createQueryClient();
  }

  // Browser: create once and reuse
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}

