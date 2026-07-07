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
    if ((host === "localhost" || host === "127.0.0.1") && Platform.OS === "android") {
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
  // In development mode, prioritize the local API URL so the emulator connects to the local Next.js backend.
  // We only use the environment variable if it specifically looks like a local IP, 
  // otherwise it accidentally overrides local dev with the production URL from eas.json.
  if (__DEV__) {
    if (envApiUrl && (envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1') || envApiUrl.includes('192.168') || envApiUrl.includes('10.0.2.2'))) {
      // If it's an Android emulator trying to use 127.0.0.1 or localhost, force 10.0.2.2
      if (Platform.OS === 'android' && (envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1'))) {
         const forcedUrl = envApiUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2').replace(/\/+$/, "");
         console.log(`[Config] Forced Android DEV API URL: ${forcedUrl}`);
         return forcedUrl;
      }
      return envApiUrl.replace(/\/+$/, "");
    }
    console.log(`[Config] Resolved DEV API URL: ${localApiUrl} (Platform: ${Platform.OS})`);
    return localApiUrl;
  }
  
  const url = envApiUrl ? envApiUrl.replace(/\/+$/, "") : productionApiUrl;
  console.log(`[Config] Resolved PROD API URL: ${url} (Platform: ${Platform.OS})`);
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
