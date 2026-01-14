// apps/cms/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANT: Only transpile what you *absolutely* need.
  // If @domain/@config are pure ESM/TS packages built to target Node/Browser,
  // prefer building them into distributable JS instead of transpiling them at runtime.
  // Remove transpilePackages if possible; leave only the minimal package names if required.
  // transpilePackages: ["@domain"],

  reactStrictMode: true,
};

module.exports = nextConfig;
