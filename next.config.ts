import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/wayfinder",
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
