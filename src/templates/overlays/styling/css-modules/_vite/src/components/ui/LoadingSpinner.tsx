import styles from './LoadingSpinner.module.css';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = styles[size] || styles.md;

  return (
    <div className={styles.container}>
      <div
        className={`${styles.spinner} ${sizeClass}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}




