// /** @type {import('next').NextConfig} */
// const withPWA = require('next-pwa');

// const nextConfig = {
//   /* config options here */
//   images: {
//     domains: [
//       "pub-261021c7b68740ffba855a7e8a6f3c1e.r2.dev", 
//       "images.unsplash.com",
//       "placehold.co",
//       "placekitten.com",
//       "picsum.photos",
//       "loremflickr.com",
//       "cloudflare-ipfs.com",
//       "via.placeholder.com",
//       "res.cloudinary.com"
//     ],
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '**',
//       },
//     ],
//   },
// };

// const pwaConfig = withPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
//   runtimeCaching: [
//     {
//       urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'google-fonts',
//         expiration: {
//           maxEntries: 4,
//           maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
//         }
//       }
//     },
//     {
//       urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
//       handler: 'StaleWhileRevalidate',
//       options: {
//         cacheName: 'static-font-assets',
//         expiration: {
//           maxEntries: 4,
//           maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
//         }
//       }
//     },
//     {
//       urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
//       handler: 'StaleWhileRevalidate',
//       options: {
//         cacheName: 'static-image-assets',
//         expiration: {
//           maxEntries: 64,
//           maxAgeSeconds: 24 * 60 * 60 // 24 hours
//         }
//       }
//     },
//     {
//       urlPattern: /\.(?:js)$/i,
//       handler: 'StaleWhileRevalidate',
//       options: {
//         cacheName: 'static-js-assets',
//         expiration: {
//           maxEntries: 32,
//           maxAgeSeconds: 24 * 60 * 60 // 24 hours
//         }
//       }
//     },
//     {
//       urlPattern: /\.(?:css|less)$/i,
//       handler: 'StaleWhileRevalidate',
//       options: {
//         cacheName: 'static-style-assets',
//         expiration: {
//           maxEntries: 32,
//           maxAgeSeconds: 24 * 60 * 60 // 24 hours
//         }
//       }
//     },
//     {
//       urlPattern: /\.(?:json|xml|csv)$/i,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'static-data-assets',
//         expiration: {
//           maxEntries: 32,
//           maxAgeSeconds: 24 * 60 * 60 // 24 hours
//         }
//       }
//     },
//     {
//       urlPattern: /\/api\/.*$/i,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'apis',
//         expiration: {
//           maxEntries: 16,
//           maxAgeSeconds: 24 * 60 * 60 // 24 hours
//         },
//         networkTimeoutSeconds: 10 // fall back to cache if api does not respond within 10 seconds
//       }
//     },
//     {
//       urlPattern: /.*$/i,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'others',
//         expiration: {
//           maxEntries: 32,
//           maxAgeSeconds: 24 * 60 * 60 // 24 hours
//         },
//         networkTimeoutSeconds: 10
//       }
//     }
//   ],
//   // Ensure compatibility with Firebase messaging service worker
//   swSrc: 'public/sw.js'
// })(nextConfig);

// module.exports = pwaConfig;


import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
    dangerouslyAllowSVG: true,
    unoptimized: false, // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  // Enhanced bundle optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-slider',
      '@radix-ui/react-label',
      'framer-motion',
      'date-fns'
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  // Enhanced compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    styledComponents: true
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 20
          },
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
            name: 'redux',
            chunks: 'all',
            priority: 15
          }
        }
      };
    }
    return config;
  }
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true
  }
})(nextConfig as any);

export default pwaConfig;