import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
  // SVG handling is configured via webpack below
  // Empty turbopack config to allow build with Turbopack (Next.js 16 default)
  turbopack: {},
  // Exclude certain folders from being compiled
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config when not using turbopack
    if (!dev || isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/article-page-app/**', '**/article-page-app-1/**']
      };
    }
    return config;
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase || !/^https?:\/\//.test(apiBase)) {
      return [];
    }
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
  // Enable CORS for development
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
