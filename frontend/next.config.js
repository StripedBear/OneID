/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
};

module.exports = nextConfig;
