/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ensures env variables are available properly
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CHANNEL_URL: process.env.NEXT_PUBLIC_CHANNEL_URL,
  },

  // helps avoid issues during deployment builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;