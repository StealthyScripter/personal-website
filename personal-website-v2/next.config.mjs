/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
