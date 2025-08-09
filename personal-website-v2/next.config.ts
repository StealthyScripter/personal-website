import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for GitHub Pages
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Set base path if your repo name is not your domain
  // basePath: '/your-repo-name', // Uncomment if needed
  
  // Ensure trailing slash for GitHub Pages
  trailingSlash: true,
  
  // Disable server-side features for static export
  experimental: {
    // esmExternals: 'loose'
  }
};

export default nextConfig;
