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

  // Turbopack empty config to silence warnings
  turbopack: {},

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
