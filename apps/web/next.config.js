/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Transpile internal packages
  transpilePackages: ["@planner/domain", "@planner/db"],

  // 2. Mark specific heavyweight/node-only packages as external
  serverExternalPackages: ["openai", "node-fetch"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },
};

export default nextConfig;