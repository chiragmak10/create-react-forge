'use client';

import StyledComponentsRegistry from '@/lib/StyledComponentsRegistry';
import { GlobalStyles } from '@/styles/globals';
import { ReactNode } from 'react';

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


