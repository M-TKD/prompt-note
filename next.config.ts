import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
