import type { NextConfig } from "next";

const FALLBACK_BACKEND_BASE_URL = 'https://tajdeediq-001-site1.stempurl.com';
const INVALID_ENV_VALUES = /^(undefined|null|https?:\/\/YOUR_BACKEND_DOMAIN)$/i;

const resolveApiBase = (): URL => {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  const candidate = raw && !INVALID_ENV_VALUES.test(raw)
    ? raw
    : FALLBACK_BACKEND_BASE_URL;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return new URL(FALLBACK_BACKEND_BASE_URL);
    }

    if (parsed.pathname.replace(/\/+$/, '') === '/api') {
      parsed.pathname = '';
    }

    return parsed;
  } catch {
    return new URL(FALLBACK_BACKEND_BASE_URL);
  }
};

const apiBase = resolveApiBase();

const apiHost = {
  protocol: apiBase.protocol.replace(':', '') as 'http' | 'https',
  hostname: apiBase.hostname,
  port: apiBase.port || undefined,
};

const nextConfig: NextConfig = {
  /* config options here */
  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: apiHost.protocol,
        hostname: apiHost.hostname,
        port: apiHost.port,
      },
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
