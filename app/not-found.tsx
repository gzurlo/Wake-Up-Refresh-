// app/not-found.tsx
export default function NotFound() {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h1>
        <p style={{ marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
        <a 
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#dc2626',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Go Home
        </a>
      </div>
    );
  }
  