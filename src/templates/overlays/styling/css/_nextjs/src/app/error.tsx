'use client';

import { useEffect } from 'react';
import './error.css';

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
    <div className="error-container" role="alert">
      <div className="error-content">
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}




