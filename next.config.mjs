/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['saicjjshmgwsitmwvomj.supabase.co'],
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      }

      // Add fallback for webpack hmr failures
      if (config.devServer) {
        config.devServer.client = {
          overlay: {
            errors: true,
            warnings: false,
          },
          reconnect: true,
        }
      }
    }
    return config
  },
}

export default nextConfig
