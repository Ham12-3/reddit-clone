import { NextConfig } from "next";

const nextConfig = {
  experimental: {
    // esmExternals: "loose" removed as noted
  },
  images: {
    remotePatterns: [
      {
        hostname: "cdn.sanity.io",
        protocol: "https",
      },
      {
        hostname: "*.sanity.io", // Wildcard to catch all subdomains
        protocol: "https",
      },
      {
        hostname: "img.clerk.com",
        protocol: "https",
      },
    ],
  },
} as NextConfig;

export default nextConfig;
