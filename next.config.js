// next.config.js
// Creado por Bernard Orozco - Next.js 15 Monorepo Config 2025
/** @type {import('next').NextConfig} */
const nextConfig = {
  // MEJOR PRÁCTICA 2025: transpilePackages para workspaces
  transpilePackages: ["@redux-claude/cognitive-core"],
  
  experimental: {
    externalDir: true
  },

  // Netlify deployment optimization
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },

  // Environment variables for build
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Disable server-side features for static export
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig