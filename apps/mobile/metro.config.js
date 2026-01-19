const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

// IMPORTANT: this must be the mobile app directory
const projectRoot = __dirname;

// Monorepo root
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the monorepo, but DO NOT change projectRoot
config.watchFolders = [workspaceRoot];

// Resolve node_modules correctly
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// THIS LINE IS CRITICAL — without it Metro walks upward
config.projectRoot = projectRoot;

module.exports = config;
