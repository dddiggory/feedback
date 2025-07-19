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
        hostname: "img.logo.dev",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
    // Add image optimization
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
    optimizePackageImports: [
      'lucide-react', 
      '@heroicons/react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'recharts'
    ],
    
    // Enable optimized CSS
    optimizeCss: true,
  },
  
  // Optimize loading performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable compression
  compress: true,
  
  // Optimize static exports
  trailingSlash: false,
  
  // Performance optimizations
  poweredByHeader: false,
};

export default nextConfig;
