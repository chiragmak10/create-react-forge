import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/auth';
import { notificationsReducer } from './slices/notifications';

/**
 * Redux store configuration following bulletproof-react patterns
 */

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

