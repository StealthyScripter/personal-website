/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.worf.replit.dev',
    '127.0.0.1',
  ],
};

export default nextConfig;
