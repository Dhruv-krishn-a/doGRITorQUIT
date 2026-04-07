import Constants from "expo-constants";

// 1. Dynamic Host Logic for local development
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(":")[0] || "localhost";
const localApiUrl = `http://${localhost}:3000`;
const productionApiUrl = "https://www.dogritorquit.in";
const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

function resolveApiUrl() {
  if (envApiUrl) return envApiUrl.replace(/\/+$/, "");
  return __DEV__ ? localApiUrl : productionApiUrl;
}

export const config = {
  // 3. Backend URL
  // Priority:
  // - EXPO_PUBLIC_API_URL (explicit env override)
  // - local host in dev
  // - production domain in release builds
  apiUrl: resolveApiUrl(),
};
