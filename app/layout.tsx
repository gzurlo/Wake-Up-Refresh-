import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Wake Up Refresh',
  description: 'Your daily morning tracking app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}