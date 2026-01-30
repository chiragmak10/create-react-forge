import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

export function Landing() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Your App</h1>
        <p className={styles.description}>
          A production-ready React application scaffolded with create-react-forge.
        </p>
        <div className={styles.buttons}>
          <Link to="/dashboard" className={styles.primaryBtn}>
            Get started
          </Link>
          <a
            href="https://github.com/alan2207/bulletproof-react"
            className={styles.linkBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}


