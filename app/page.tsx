import Image from 'next/image';
import Link from 'next/link';

export default function HomeScreen() {
  return (
    <div className="container">
      {/* Header Section */}
      <header className="header">
        <div className="react-logo">
          <Image
            src="/images/partial-react-logo.png"
            alt="React Logo"
            width={290}
            height={178}
            style={{ 
              position: 'absolute',
              bottom: 0,
              left: 0
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="content">
        <div className="title-container">
          <h1 className="title">Welcome!</h1>
          <div className="wave">👋</div>
        </div>

        <div className="step-container">
          <h2 className="subtitle">Step 1: Try it</h2>
          <p>
            Edit <strong>app/page.tsx</strong> to see changes.
            Press{' '}
            <strong>
              {typeof window !== 'undefined' && navigator.platform.includes('Mac') 
                ? 'cmd + d' 
                : 'F12'
              }
            </strong>{' '}
            to open developer tools.
          </p>
        </div>

        <div className="step-container">
          <Link href="/explore" className="explore-link">
            <h2 className="subtitle">Step 2: Explore</h2>
          </Link>
          <p>
            Tap the Explore tab to learn more about what&apos;s included in this starter app.
          </p>
        </div>

        <div className="step-container">
          <h2 className="subtitle">Step 3: Get a fresh start</h2>
          <p>
            When you&apos;re ready, run <code>npm run reset-project</code> to get a fresh{' '}
            <code>app</code> directory. This will move the current <code>app</code> to{' '}
            <code>app-example</code>.
          </p>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #A1CEDC, #ffffff);
        }

        @media (prefers-color-scheme: dark) {
          .container {
            background: linear-gradient(to bottom, #1D3D47, #000000);
          }
        }

        .header {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .react-logo {
          position: relative;
          height: 100%;
        }

        .content {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .title-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .title {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
          color: #1a1a1a;
        }

        @media (prefers-color-scheme: dark) {
          .title {
            color: #ffffff;
          }
        }

        .wave {
          font-size: 1.5rem;
          animation: wave 2s infinite;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }

        .step-container {
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (prefers-color-scheme: dark) {
          .step-container {
            background: rgba(255, 255, 255, 0.1);
          }
        }

        .subtitle {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #0a7ea4;
        }

        .explore-link {
          text-decoration: none;
          color: inherit;
        }

        .explore-link:hover {
          opacity: 0.8;
        }

        p {
          margin: 0;
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

        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        @media (prefers-color-scheme: dark) {
          code {
            background: #2a2a2a;
            color: #fff;
          }
        }
      `}</style>
    </div>
  );
}
