/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. THIS IS REQUIRED for code from 'packages/' to work
  transpilePackages: ["@domain", "@config", "@api"],
  
  // 2. Helps catch bugs
  reactStrictMode: true,
};

module.exports = nextConfig;