/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  webpack: (config, { dev }) => {
    // Suppress webpack 5's `PackFileCacheStrategy` warning about big
    // strings (106-124 kiB) by disabling the disk cache for the entire
    // production build. Mantine + Leaflet ship large CSS-in-JS and
    // polyfill chunks that webpack tries to serialize into the pack
    // file cache; the warning fires repeatedly even though the build
    // itself succeeds.
    //
    // Trade-off: each production build starts cold (no incremental
    // cache hits), so subsequent builds are marginally slower. Dev mode
    // (`dev: true`) keeps its in-memory cache so HMR is unaffected.
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
