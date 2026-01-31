import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} role="status" aria-label="Loading" />
    </div>
  );
}



