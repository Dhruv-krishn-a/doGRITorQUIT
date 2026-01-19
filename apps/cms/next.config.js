/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Keep transpiling your local packages
  transpilePackages: ["@planner/domain", "@planner/db", "@planner/api"],

  // 2. Mark heavyweight libraries as external
  experimental: {
    serverComponentsExternalPackages: ["@planner/domain", "openai", "razorpay"],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },

  // 3. THE FIX: Manually externalize the missing dependencies
  webpack: (config) => {
    config.externals.push({
      'node-fetch': 'commonjs node-fetch',
      'formdata-node': 'commonjs formdata-node',
      'agentkeepalive': 'commonjs agentkeepalive',
      'form-data-encoder': 'commonjs form-data-encoder',
      'formdata-node/file-from-path': 'commonjs formdata-node/file-from-path',
    });
    return config;
  },
};

module.exports = nextConfig;