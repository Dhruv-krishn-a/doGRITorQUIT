/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@planner/domain", "@planner/db", "@planner/api"],
  
  serverExternalPackages: [
    "openai", 
    "razorpay", 
    "node-fetch", 
    "formdata-node", 
    "agentkeepalive"
  ],

  // Turbopack empty config to silence warnings
  turbopack: {},

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;