'use client';

import { ReactNode } from 'react';
import StyledComponentsRegistry from '@/lib/StyledComponentsRegistry';
import { GlobalStyles } from '@/styles/globals';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      {children}
    </StyledComponentsRegistry>
  );
}

