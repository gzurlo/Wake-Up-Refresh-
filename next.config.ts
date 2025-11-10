// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Add this if you're using environment variables
  env: {
    customKey: 'my-value',
  },
};

export default nextConfig;
