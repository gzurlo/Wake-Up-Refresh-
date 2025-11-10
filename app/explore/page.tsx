'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ExplorePage() {
  const [openSections, setOpenSections] = useState({
    routing: true,
    platform: false,
    images: false,
    themes: false,
    animations: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Explore</h1>
      <p>This app includes example code to help you get started.</p>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, margin: '16px 0', overflow: 'hidden' }}>
        <button 
          onClick={() => toggleSection('routing')}
          style={{
            width: '100%',
            padding: 16,
            background: '#f9f9f9',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <span>File-based routing</span>
          <span style={{ transform: openSections.routing ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </button>
        {openSections.routing && (
          <div style={{ padding: 16, background: 'white' }}>
            <p>This app has two screens: <strong>app/page.tsx</strong> and <strong>app/explore/page.tsx</strong></p>
            <p>The layout file in <strong>app/layout.tsx</strong> sets up the root layout.</p>
            <a href="https://nextjs.org/docs/app" target="_blank" rel="noopener noreferrer" style={{ color: '#0a7ea4', textDecoration: 'none' }}>
              Learn more
            </a>
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link href="/" style={{ color: '#0a7ea4', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}