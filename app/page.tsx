cat > app/page.tsx << 'EOF'
'use client';

export default function HomePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to Wake Up Refresh!</h1>
      <p>Your app is running successfully.</p>
      <a href="/explore" style={{ color: '#0a7ea4', textDecoration: 'none' }}>
        Go to Explore ›
      </a>
    </div>
  );
}
EOF