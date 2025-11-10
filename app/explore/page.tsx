'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ExplorePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
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
    <div className="explore-container">
      {/* Header */}
      <div className="explore-header">
        <div className="header-icon">
          <span style={{ fontSize: '310px', color: '#808080', opacity: 0.3 }}>
            ⎋
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="explore-content">
        <div className="title-container">
          <h1 className="explore-title">Explore</h1>
        </div>
        
        <p>This app includes example code to help you get started.</p>

        {/* File-based routing */}
        <CollapsibleSection 
          title="File-based routing" 
          isOpen={openSections.routing}
          onToggle={() => toggleSection('routing')}
        >
          <p>
            This app has two screens:{' '}
            <strong>app/page.tsx</strong> and{' '}
            <strong>app/explore/page.tsx</strong>
          </p>
          <p>
            The layout file in <strong>app/layout.tsx</strong>{' '}
            sets up the root layout.
          </p>
          <ExternalLink href="https://nextjs.org/docs/app">
            Learn more
          </ExternalLink>
        </CollapsibleSection>

        {/* Web support */}
        <CollapsibleSection 
          title="Web support" 
          isOpen={openSections.platform}
          onToggle={() => toggleSection('platform')}
        >
          <p>
            This is a Next.js web application that runs in any modern browser.
            Press{' '}
            <strong>F12</strong> to open developer tools.
          </p>
        </CollapsibleSection>

        {/* Images */}
        <CollapsibleSection 
          title="Images" 
          isOpen={openSections.images}
          onToggle={() => toggleSection('images')}
        >
          <p>
            For static images, you can use the Next.js Image component for 
            optimized loading and responsive images.
          </p>
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <Image
              src="/images/react-logo.png"
              alt="React Logo"
              width={100}
              height={100}
              style={{ alignSelf: 'center' }}
            />
          </div>
          <ExternalLink href="https://nextjs.org/docs/api-reference/next/image">
            Learn more
          </ExternalLink>
        </CollapsibleSection>

        {/* Light and dark mode */}
        <CollapsibleSection 
          title="Light and dark mode components" 
          isOpen={openSections.themes}
          onToggle={() => toggleSection('themes')}
        >
          <p>
            This template has light and dark mode support using CSS media queries
            and next-themes library.
          </p>
          <ExternalLink href="https://nextjs.org/docs/app/building-your-application/styling/dark-mode">
            Learn more
          </ExternalLink>
        </CollapsibleSection>

        {/* Animations */}
        <CollapsibleSection 
          title="Animations" 
          isOpen={openSections.animations}
          onToggle={() => toggleSection('animations')}
        >
          <p>
            This template includes examples of animated components using CSS animations
            and Framer Motion for more complex interactions.
          </p>
        </CollapsibleSection>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .explore-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #D0D0D0, #ffffff);
        }

        @media (prefers-color-scheme: dark) {
          .explore-container {
            background: linear-gradient(to bottom, #353636, #000000);
          }
        }

        .explore-header {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .header-icon {
          position: absolute;
          bottom: -90px;
          left: -35px;
        }

        .explore-content {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .title-container {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .explore-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
          color: #1a1a1a;
        }

        @media (prefers-color-scheme: dark) {
          .explore-title {
            color: #ffffff;
          }
        }

        p {
          margin: 8px 0;
          line-height: 1.5;
          color: #333;
        }

        @media (prefers-color-scheme: dark) {
          p {
            color: #ccc;
          }
        }

        strong {
          font-weight: 600;
        }

        .back-link {
          color: #0a7ea4;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

// Collapsible Component
function CollapsibleSection({ 
  title, 
  children, 
  isOpen, 
  onToggle 
}: { 
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="collapsible-section">
      <button 
        className="collapsible-header"
        onClick={onToggle}
      >
        <span>{title}</span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}

      <style jsx>{`
        .collapsible-section {
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 16px 0;
          overflow: hidden;
        }

        @media (prefers-color-scheme: dark) {
          .collapsible-section {
            border-color: #444;
          }
        }

        .collapsible-header {
          width: 100%;
          padding: 16px;
          background: #f9f9f9;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
        }

        @media (prefers-color-scheme: dark) {
          .collapsible-header {
            background: #2a2a2a;
            color: #fff;
          }
        }

        .collapsible-header:hover {
          background: #eee;
        }

        @media (prefers-color-scheme: dark) {
          .collapsible-header:hover {
            background: #333;
          }
        }

        .arrow {
          transition: transform 0.2s;
        }

        .arrow.open {
          transform: rotate(180deg);
        }

        .collapsible-content {
          padding: 16px;
          background: white;
        }

        @media (prefers-color-scheme: dark) {
          .collapsible-content {
            background: #1a1a1a;
          }
        }
      `}</style>
    </div>
  );
}

// External Link Component
function ExternalLink({ 
  href, 
  children 
}: { 
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="external-link"
    >
      {children}

      <style jsx>{`
        .external-link {
          color: #0a7ea4;
          text-decoration: none;
          display: inline-block;
          margin-top: 8px;
        }

        .external-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </a>
  );
}