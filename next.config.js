/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint checking during the production build to avoid lint warnings breaking the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // You can add other Next.js config options here
};

module.exports = nextConfig;
