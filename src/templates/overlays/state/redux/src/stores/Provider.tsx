'use client';

import { Provider } from 'react-redux';
import { store } from './store';

type StoreProviderProps = {
  children: React.ReactNode;
};

/**
 * Redux Provider component
 * Wrap your app with this to enable Redux state management
 */
export function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}

