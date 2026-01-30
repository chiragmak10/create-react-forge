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
  title: {
    fontSize: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  description: {
    marginTop: '1.5rem',
    fontSize: '1.125rem',
    lineHeight: '2rem',
    color: '#4b5563',
  },
  actions: {
    marginTop: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
  },
  primaryLink: {
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'white',
    backgroundColor: '#4f46e5',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  secondaryLink: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: '1.5rem',
    color: 'inherit',
    textDecoration: 'none',
  },
};

export default function HomePage() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome to Your App</h1>
        <p style={styles.description}>
          A production-ready Next.js application scaffolded with create-react-forge.
        </p>
        <div style={styles.actions}>
          <Link href="/dashboard" style={styles.primaryLink}>
            Get started
          </Link>
          <a
            href="https://github.com/alan2207/bulletproof-react"
            style={styles.secondaryLink}
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
