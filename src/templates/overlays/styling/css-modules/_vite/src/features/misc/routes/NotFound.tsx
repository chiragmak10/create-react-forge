import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className={styles.buttons}>
          <Link to="/" className={styles.primaryBtn}>
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}




