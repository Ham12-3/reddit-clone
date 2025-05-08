import { NextConfig } from "next";

const nextConfig = {
  // Images configuration removed since you no longer need those domains
  // Remove incompatible experimental features
  experimental: {
    // esmExternals: "loose", // This causes Turbopack to crash
  },
} as NextConfig;

export default nextConfig;
