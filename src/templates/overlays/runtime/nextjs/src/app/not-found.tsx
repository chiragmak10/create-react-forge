import Link from 'next/link';

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
  errorCode: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#4f46e5',
  },
  title: {
    marginTop: '1rem',
    fontSize: '1.875rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  description: {
    marginTop: '1.5rem',
    fontSize: '1rem',
    lineHeight: '1.75rem',
    color: '#4b5563',
  },
  actions: {
    marginTop: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
  },
  homeLink: {
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'white',
    backgroundColor: '#4f46e5',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
};

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <p style={styles.errorCode}>404</p>
        <h1 style={styles.title}>Page not found</h1>
        <p style={styles.description}>
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div style={styles.actions}>
          <Link href="/" style={styles.homeLink}>
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
