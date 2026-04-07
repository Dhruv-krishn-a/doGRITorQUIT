/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Transpile internal packages
  transpilePackages: [
    "@gritorquit/domain", 
    "@gritorquit/db",
    "@gritorquit/notes-ui-web",
    "@gritorquit/study-ui-web", 
    "@gritorquit/study-core",
    "@gritorquit/habits-ui-web",
    "@gritorquit/habits-core",
    "@gritorquit/dashboard-ui-web",
    "@gritorquit/dashboard-core",
    "@gritorquit/api",
    "@gritorquit/config",
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
