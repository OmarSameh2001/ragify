import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    "faiss",
    "faiss-node",
  ],
};

export default nextConfig;
