import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
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
