// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Add this line for static exports
  trailingSlash: true,
  images: {
    unoptimized: true // If you're using next/image
  }
};

export default nextConfig;
