import { NextConfig } from "next";

const nextConfig = {
  output: "standalone",
  swcMinify: true,
  experimental: {
    swcLoader: true,
    swcMinify: true,
    swcWasm: true,
  },
};

export default nextConfig; 