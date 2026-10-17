const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

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

// Prevent Metro from ever trying to resolve @types packages.
// pnpm often hoists @types/react into the mobile node_modules, and Metro's
// resolver gets confused and tries to use its package.json instead of the real React.
const exclusionList = require("metro-config/src/defaults/exclusionList");
config.resolver.blockList = exclusionList([
  /.*\/@types\/.*/
]);

// 2. Explicit module mappings.
// pnpm hoists @types/react into apps/mobile/node_modules/@types/react,
// and Metro's resolver erroneously picks it up when resolving bare "react"
// imports. By explicitly mapping core packages, we bypass Metro's broken
// @types resolution entirely.
const mobileModules = path.resolve(projectRoot, "node_modules");
const rootModules = path.resolve(workspaceRoot, "node_modules");

function resolveModule(name) {
  const local = path.resolve(mobileModules, name);
  if (fs.existsSync(local)) return local;
  const root = path.resolve(rootModules, name);
  if (fs.existsSync(root)) return root;
  return local; // fallback
}

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // Pin ALL React ecosystem packages to mobile's node_modules (React 18.3.1).
  // The root node_modules has React 19 (for the web app), and if Metro
  // resolves even one React-related package from the root, two React
  // instances load simultaneously, crashing with "ReactCurrentOwner undefined".
  "react": resolveModule("react"),
  "react-dom": resolveModule("react-dom"),
  "react-native": resolveModule("react-native"),
  "react-is": resolveModule("react-is"),
  "react-freeze": resolveModule("react-freeze"),
  "react-native-reanimated": resolveModule("react-native-reanimated"),
  "react-native-screens": resolveModule("react-native-screens"),
  "react-native-gesture-handler": resolveModule("react-native-gesture-handler"),
  "react-native-safe-area-context": resolveModule("react-native-safe-area-context"),
  "react-native-svg": resolveModule("react-native-svg"),
  "react-native-web": resolveModule("react-native-web"),
  "react-native-webview": resolveModule("react-native-webview"),
  "react-native-css-interop": resolveModule("react-native-css-interop"),
  "react-native-drawer-layout": resolveModule("react-native-drawer-layout"),
  // WatermelonDB Node mock
  "better-sqlite3": path.resolve(projectRoot, "./db/mocks/better-sqlite3.js"),
  // Webview alias
  "react-native-web-webview": require.resolve("react-native-webview"),
  // Shared domain package
  "@gritorquit/domain": path.resolve(workspaceRoot, "packages/domain"),
};

// 3. Custom resolver: Ensures a single React instance across the entire bundle.
// In this monorepo, root node_modules has React 19 (for web) and mobile has
// React 18.3.1. Without this, transitive dependencies (e.g. expo-router
// importing react) can resolve to the root copy, loading two React instances
// and crashing with "ReactCurrentOwner undefined".
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Never resolve @types as runtime modules
  if (moduleName.startsWith("@types/")) {
    return { type: "empty" };
  }

  // Force react and all react-native-* to resolve from mobile's node_modules
  if (moduleName === "react" || moduleName === "react/jsx-runtime" || moduleName === "react/jsx-dev-runtime") {
    const reactPath = moduleName === "react"
      ? path.resolve(mobileModules, "react")
      : path.resolve(mobileModules, moduleName);
    if (fs.existsSync(reactPath)) {
      return context.resolveRequest(
        { ...context, nodeModulesPaths: [mobileModules] },
        moduleName,
        platform
      );
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

// Force Metro to resolve Expo's asset hashing plugin from the mobile app scope.
config.transformer.assetPlugins = [
  path.resolve(projectRoot, "node_modules/expo-asset/tools/hashAssetFiles"),
];

// 4. Wrap with NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });
