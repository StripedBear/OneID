import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // оставим, если у вас нет image optimization
  },
};

export default nextConfig;
