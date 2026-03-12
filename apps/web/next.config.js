/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Transpile internal packages (ADDED STUDY & HABITS PACKAGES HERE)
  transpilePackages: [
    "@planner/domain", 
    "@planner/db",
    "@planner/study-ui-web", 
    "@planner/study-core",
    "@planner/habits-ui-web",
    "@planner/habits-core",
    "@planner/dashboard-ui-web",
    "@planner/dashboard-core",
    "@repo/ui"
  ],

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
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;