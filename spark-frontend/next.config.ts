import type { NextConfig } from 'next';

// Where the FastAPI backend runs. In production nginx usually routes /api straight to
// the backend; this rewrite covers `next dev` and setups without nginx in front.
const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://127.0.0.1:8001';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: 'standalone',
  experimental: {
    // Only ship the icons we actually import.
    optimizePackageImports: ['lucide-react'],
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backendOrigin}/api/:path*` }];
  },
};

export default nextConfig;
