import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (deploy target is a KZ cloud, not Vercel).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
