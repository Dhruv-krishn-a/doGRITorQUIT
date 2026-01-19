/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@planner/domain", "@planner/db", "@planner/api"],
  
  // This is the standard way to handle Node-only packages in Next 15/16
  serverExternalPackages: [
    "openai", 
    "razorpay", 
    "node-fetch", 
    "formdata-node", 
    "agentkeepalive"
  ],

  // ✅ SILENCE TURBOPACK ERROR
  // Providing an empty object tells Next.js you are aware of Turbopack
  turbopack: {},

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // This will run if you use Fix 1 (--webpack) or if Turbopack falls back
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    };
    return config;
  },
};

export default nextConfig;