import Constants from "expo-constants";
import { Platform } from "react-native";

// 1. Dynamic Host Logic for local development
// In newer Expo versions, hostUri might be in different places or missing in Dev Clients
const debuggerHost = Constants.expoConfig?.hostUri || Constants.experienceId; 
// experienceId is often just the slug, not useful for IP. 
// Let's try to find the IP address more reliably.

const getLocalhost = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    // If Expo is forced to localhost (e.g. via --localhost flag), 
    // Android emulator still needs 10.0.2.2 to reach the host machine.
    if (host === "localhost" && Platform.OS === "android") {
      return "10.0.2.2";
    }
    return host;
  }
  // Fallback for Android emulator when hostUri is missing
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }
  return "localhost";
};

const localhost = getLocalhost();
const localApiUrl = `http://${localhost}:3000`;
const productionApiUrl = "https://www.dogritorquit.in";
const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

function resolveApiUrl() {
  if (envApiUrl) return envApiUrl.replace(/\/+$/, "");
  
  const url = __DEV__ ? localApiUrl : productionApiUrl;
  console.log(`[Config] Resolved API URL: ${url} (Platform: ${Platform.OS}, __DEV__: ${__DEV__})`);
  return url;
}

export const config = {
  // 3. Backend URL
  // Priority:
  // - EXPO_PUBLIC_API_URL (explicit env override)
  // - local host in dev
  // - production domain in release builds
  apiUrl: resolveApiUrl(),
};
