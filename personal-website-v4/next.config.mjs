const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  devIndicators: false,
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
  // Resolve content existence and metadata before committing response headers.
  htmlLimitedBots: /.*/,
  // Keep this independent app isolated from the historical root lockfile.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
