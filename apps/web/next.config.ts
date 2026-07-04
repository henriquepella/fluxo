import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Minimal self-contained server bundle, required by the Docker image.
  output: 'standalone',
};

export default nextConfig;
