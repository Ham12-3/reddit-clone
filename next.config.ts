import { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      "uk.linkedin.com",
      "linkedin.com",
      "www.linkedin.com",
      "cdn.sanity.io",
    ],
  },
  // Remove incompatible experimental features
  experimental: {
    // esmExternals: "loose", // This causes Turbopack to crash
  },
} as NextConfig;

export default nextConfig;
