import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  devIndicators: false,
};

export default nextConfig;
