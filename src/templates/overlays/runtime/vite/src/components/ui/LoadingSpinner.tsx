type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-16 w-16',
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${sizes[size]} ${className}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

