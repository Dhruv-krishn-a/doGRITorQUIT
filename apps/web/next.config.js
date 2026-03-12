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
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "http://localhost:1420" }, 
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;