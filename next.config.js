/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable detailed error reporting in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Add custom webpack config for better error messages
  webpack: (config, { dev }) => {
    if (dev) {
      // Match Next.js default to avoid warnings
      config.devtool = 'eval-source-map';
    }
    return config;
  },
  // Add logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Remove deprecated experimental flags to avoid warnings
}

module.exports = nextConfig