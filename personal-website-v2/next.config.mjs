/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.worf.replit.dev',
  ],
};

export default nextConfig;
