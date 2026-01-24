import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW worker for browser environment (development)
 * Import and start in your app entry point for API mocking during development
 *
 * Example:
 * ```ts
 * if (import.meta.env.DEV) {
 *   const { worker } = await import('./testing/mocks/browser');
 *   await worker.start({ onUnhandledRequest: 'bypass' });
 * }
 * ```
 */
export const worker = setupWorker(...handlers);

