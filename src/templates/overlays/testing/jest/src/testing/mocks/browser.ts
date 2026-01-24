import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW worker for browser environment (development)
 * Import and start in your app entry point for API mocking during development
 *
 * Example:
 * ```ts
 * if (process.env.NODE_ENV === 'development') {
 *   const { worker } = await import('./testing/mocks/browser');
 *   await worker.start({ onUnhandledRequest: 'bypass' });
 * }
 * ```
 */
export const worker = setupWorker(...handlers);

