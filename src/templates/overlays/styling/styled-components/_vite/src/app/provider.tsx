import { ErrorFallback } from '@/components/errors/ErrorFallback';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GlobalStyles } from '@/styles/globals';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BrowserRouter>
          <GlobalStyles />
          {children}
        </BrowserRouter>
      </ErrorBoundary>
    </Suspense>
  );
}

