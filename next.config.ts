import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },

  experimental: {
    // Only enable features available in stable Next.js 15
    // ppr: true, // Uncomment when using canary Next.js
    
    // Enable staleTimes for better client-side caching
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    
    // Optimize bundling for faster navigation
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  
  // Optimize loading performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
