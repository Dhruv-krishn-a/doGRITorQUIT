import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@gritorquit/domain", 
    "@gritorquit/db", 
    "@gritorquit/dashboard-core",
    "@gritorquit/dashboard-ui-web",
    "@gritorquit/habits-core",
    "@gritorquit/habits-ui-web",
    "@gritorquit/notes-ui-web",
    "@gritorquit/study-core",
    "@gritorquit/study-ui-web",
  ],
  
  serverExternalPackages: [
    "openai", 
    "razorpay", 
    "node-fetch", 
    "formdata-node", 
    "agentkeepalive"
  ],

  // Turbopack config to fix workspace root
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
