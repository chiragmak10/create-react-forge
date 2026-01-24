'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from './react-query';

type QueryProviderProps = {
  children: React.ReactNode;
};

/**
 * React Query Provider with DevTools
 * Wrap your app with this component to enable data fetching
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each request (for SSR)
  // but reuse the same instance on client-side navigation
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

