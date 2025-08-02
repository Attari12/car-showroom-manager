/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Improve development performance and HMR
  env: {
    FAST_REFRESH: 'true',
  },
  // Additional dev server optimizations
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  images: {
    domains: ['saicjjshmgwsitmwvomj.supabase.co'],
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      }

      // Enhanced HMR configuration
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }

      // Optimize chunks for better HMR
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: {
              chunks: 'all',
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      }

      // Add fallback for webpack hmr failures
      if (config.devServer) {
        config.devServer.client = {
          overlay: {
            errors: true,
            warnings: false,
          },
          reconnect: true,
          webSocketTransport: 'ws',
        }
      }
    }
    return config
  },
}

export default nextConfig
