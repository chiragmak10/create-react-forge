import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that includes providers
 * Following bulletproof-react testing patterns
 */

type WrapperProps = {
  children: ReactNode;
};

function AllProviders({ children }: WrapperProps) {
  // Keep this runtime-agnostic for both Vite and Next.js templates.
  return <>{children}</>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
