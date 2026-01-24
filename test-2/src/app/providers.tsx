'use client';

import { ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // Add providers here (React Query, Theme, etc.)
  // They will be added by feature overlays
  return <>{children}</>;
}

