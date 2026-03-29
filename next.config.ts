import type { NextConfig } from "next";

const apiHost = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  if (!raw || /^(undefined|null)$/i.test(raw)) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return { protocol: parsed.protocol.replace(':', ''), hostname: parsed.hostname, port: parsed.port || undefined };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  /* config options here */
  // Image configuration for external domains
  images: {
    remotePatterns: [
      ...(apiHost ? [{
        protocol: apiHost.protocol as 'http' | 'https',
        hostname: apiHost.hostname,
        port: apiHost.port,
      }] : []),
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7065',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7065',
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
    const rawApiBase = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();

    // Prevent invalid rewrites when env vars are missing or set to placeholder strings.
    if (!rawApiBase || /^(undefined|null)$/i.test(rawApiBase)) {
      return [];
    }

    let apiBase: URL;
    try {
      apiBase = new URL(rawApiBase);
    } catch {
      return [];
    }

    if (apiBase.protocol !== 'http:' && apiBase.protocol !== 'https:') {
      return [];
    }

    const normalizedApiBase = apiBase.toString().replace(/\/$/, '');

    return [
      {
        source: '/api/backend/:path*',
        destination: `${normalizedApiBase}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${normalizedApiBase}/uploads/:path*`,
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
