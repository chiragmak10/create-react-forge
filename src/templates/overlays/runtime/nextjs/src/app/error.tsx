'use client';

import { useEffect } from 'react';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#dc2626',
  },
  message: {
    marginTop: '1rem',
    color: '#4b5563',
  },
  retryButton: {
    marginTop: '1.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'white',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    cursor: 'pointer',
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={styles.container} role="alert">
      <div style={styles.content}>
        <h1 style={styles.title}>Something went wrong</h1>
        <p style={styles.message}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <button onClick={reset} style={styles.retryButton}>
          Try again
        </button>
      </div>
    </div>
  );
}
