// next.config.js
// Creado por Bernard Orozco - Next.js 15 Monorepo Config 2025
/** @type {import('next').NextConfig} */
const nextConfig = {
  // MEJOR PRÁCTICA 2025: transpilePackages para workspaces
  transpilePackages: ["@redux-claude/cognitive-core"],
  
  experimental: {
    externalDir: true
  }
}

module.exports = nextConfig