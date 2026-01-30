const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '2rem',
    height: '2rem',
    border: '2px solid #d1d5db',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default function Loading() {
  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.spinner} role="status" aria-label="Loading" />
    </div>
  );
}
