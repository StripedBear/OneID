import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
};

export default nextConfig;
