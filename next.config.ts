import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable HTTPS for dev server (required for Privy wallet on mobile)
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
