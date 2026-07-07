const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Monorepo Setup
config.watchFolders = [workspaceRoot];
config.resolver.disableHierarchicalLookup = true;

// Handle WatermelonDB Node dependencies for non-node platforms
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "better-sqlite3": path.resolve(__dirname, "./db/mocks/better-sqlite3.js"),
  "react-native-web-webview": require.resolve("react-native-webview"),
  "@gritorquit/domain": path.resolve(workspaceRoot, "packages/domain"),
};

// Force Metro to resolve Expo's asset hashing plugin from the mobile app scope.
config.transformer.assetPlugins = [
  path.resolve(projectRoot, "node_modules/expo-asset/tools/hashAssetFiles"),
];

// 2. Wrap with NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });
