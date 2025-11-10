cat > app/modal.tsx << 'EOF'
'use client';

import Link from 'next/link';

export default function ModalScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>
        This is a modal
      </h1>
      <Link href="/" style={{ marginTop: '15px', padding: '15px 0', textDecoration: 'none' }}>
        <span style={{ color: '#0a7ea4', fontSize: '1.1rem' }}>Go to home screen</span>
      </Link>
    </div>
  );
}
EOF