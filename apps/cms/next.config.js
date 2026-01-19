/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@planner/domain", "@planner/db", "@planner/api"],

  experimental: {
    serverComponentsExternalPackages: ["openai", "razorpay"],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },

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