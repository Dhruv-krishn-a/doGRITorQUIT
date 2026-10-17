import Constants from "expo-constants";
import * as Device from "expo-device";
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
    // However, PHYSICAL devices cannot resolve 10.0.2.2!
    if (
      (host === "localhost" || host === "127.0.0.1") &&
      Platform.OS === "android" &&
      !Device.isDevice
    ) {
      return "10.0.2.2";
    }
    return host;
  }
  // Fallback for Android emulator when hostUri is missing
  if (Platform.OS === "android" && !Device.isDevice) {
    return "10.0.2.2";
  }
  return "localhost";
};

const localhost = getLocalhost();
const localApiUrl = `http://${localhost}:3000`;
const productionApiUrl = "https://www.dogritorquit.in";
const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

function resolveApiUrl() {
  if (__DEV__) {
    // If the user explicitly set an API URL in .env, use it!
    // This allows testing against the live production server (gritorquit.in)
    // without needing to run the local Next.js backend.
    if (envApiUrl) {
      if (
        Platform.OS === "android" &&
        !Device.isDevice &&
        (envApiUrl.includes("localhost") || envApiUrl.includes("127.0.0.1"))
      ) {
        const forcedUrl = envApiUrl
          .replace("localhost", "10.0.2.2")
          .replace("127.0.0.1", "10.0.2.2")
          .replace(/\/+$/, "");
        console.log(`[Config] Forced Android DEV API URL: ${forcedUrl}`);
        return forcedUrl;
      }
      console.log(`[Config] Resolved DEV API URL from ENV: ${envApiUrl}`);
      return envApiUrl.replace(/\/+$/, "");
    }

    // Fallback to localhost if nothing is specified in .env
    console.log(
      `[Config] Resolved DEV API URL (Fallback): ${localApiUrl} (Platform: ${Platform.OS}, isDevice: ${Device.isDevice})`,
    );
    return localApiUrl;
  }

  const url = envApiUrl ? envApiUrl.replace(/\/+$/, "") : productionApiUrl;
  console.log(
    `[Config] Resolved PROD API URL: ${url} (Platform: ${Platform.OS})`,
  );
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
