/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve development server stability
  reactStrictMode: false, // Disable strict mode to prevent double renders in dev
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Fix RSC payload issues
    serverActions: true,
    esmExternals: 'loose',
  },
  // Improve development performance and HMR
  env: {
    FAST_REFRESH: 'true',
  },
  images: {
    domains: ['saicjjshmgwsitmwvomj.supabase.co'],
    unoptimized: true,
  },
  // Enhanced development configuration for better HMR stability
  ...(process.env.NODE_ENV === 'development' && {
    compress: false,
    poweredByHeader: false,
    generateEtags: false,
    // Improve HMR reliability
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
    },
    // Disable problematic optimizations
    swcMinify: false,
  }),

  // Headers to prevent caching issues
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ];
    }
    return [];
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Reduce HMR noise and improve stability
      config.infrastructureLogging = {
        level: 'warn',
      }

      // Enhanced watch options for better HMR
      config.watchOptions = {
        aggregateTimeout: 1000, // Increased to reduce rapid rebuilds
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
        // Add polling as fallback for network issues
        poll: false,
      }

      // Fix client-side chunk loading issues
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        }

        // Improve HMR chunk loading
        config.output = {
          ...config.output,
          hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
          hotUpdateMainFilename: 'static/webpack/[fullhash].hot-update.json',
        }

        // Add better error handling for chunk loading
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            ...config.optimization.splitChunks,
            chunks: 'all',
            cacheGroups: {
              ...config.optimization.splitChunks?.cacheGroups,
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
                reuseExistingChunk: true,
              },
            },
          },
        }
      }
    }
    return config
  },
}

export default nextConfig
