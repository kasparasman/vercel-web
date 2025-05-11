/** @type {import('next').NextConfig} */
const nextConfig = {
  // We want to use Pages Router instead of App Router
  // So we don't need export mode for this use case
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Simplified webpack configuration to avoid caching issues
  webpack: (config) => {
    // Disable filesystem cache to prevent write errors
    config.cache = false;
    return config;
  }
};

module.exports = nextConfig;