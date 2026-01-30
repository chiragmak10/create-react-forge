import { FallbackProps } from 'react-error-boundary';
import styles from './ErrorFallback.module.css';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className={styles.container} role="alert">
      <div className={styles.content}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <button onClick={resetErrorBoundary} className={styles.button}>
          Try again
        </button>
      </div>
    </div>
  );
}


