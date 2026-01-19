/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 1. Tell Next.js to compile your internal workspace packages
  transpilePackages: ["@planner/domain", "@planner/db", "@planner/api"],

  // ✅ 2. Only keep native/heavy binaries here. 
  // REMOVED "@planner/domain" because it is just TS code and needs to be bundled.
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

  // 3. Keep your webpack fixes if they were solving specific node-fetch issues
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