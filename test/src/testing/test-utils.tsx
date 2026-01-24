import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that includes providers
 * Following bulletproof-react testing patterns
 */

type WrapperProps = {
  children: ReactNode;
};

function AllProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {/* Add other providers here (React Query, Theme, etc.) */}
      {children}
    </BrowserRouter>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

