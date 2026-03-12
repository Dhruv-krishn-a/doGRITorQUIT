const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Monorepo Setup
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

// Exclude build/cache directories from Metro watcher to prevent ENOENT crashes
const exclusionList = require("metro-config/src/defaults/exclusionList");
config.resolver.blockList = exclusionList([
  /.*\/apps\/desktop\/src-tauri\/target\/.*/,
  /.*\/apps\/web\/\.next\/.*/,
  /.*\/apps\/cms\/\.next\/.*/,
  /.*\/\.turbo\/.*/,
]);

// 2. Wrap with NativeWind
// Point this to where your global CSS file is
module.exports = withNativeWind(config, { input: "./global.css" });