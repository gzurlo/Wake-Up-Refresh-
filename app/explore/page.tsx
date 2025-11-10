'use client';
import Link from 'next/link';
import React from 'react';

export default function ExplorePage() {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Explore</h1>
      <p>This app includes example code to help you get started.</p>
      
      <div style={{ marginBottom: 20, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <h3>File-based routing</h3>
        <p>This app has two screens: <strong>app/page.tsx</strong> and <strong>app/explore/page.tsx</strong></p>
        <p>The layout file in <strong>app/layout.tsx</strong> sets up the root layout.</p>
      </div>

      <div style={{ marginBottom: 20, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <h3>Web Support</h3>
        <p>This is a Next.js web application that runs in any modern browser.</p>
        <p>Press <strong>F12</strong> to open developer tools.</p>
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link href="/" style={{ color: '#0a7ea4', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
