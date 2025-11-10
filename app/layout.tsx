// app/layout.tsx
import type { Metadata } from 'next';
import React from 'react';
import './globals.css'; // This import is crucial

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
      <body>{children}</body>
    </html>
  );
}