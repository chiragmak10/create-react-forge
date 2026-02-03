import { FallbackProps } from 'react-error-boundary';
import './ErrorFallback.css';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="error-container" role="alert">
      <div className="error-content">
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button onClick={resetErrorBoundary} className="btn btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}




