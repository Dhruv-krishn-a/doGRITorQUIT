import Constants from "expo-constants";

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(":")[0] || "localhost";

export const API_URL = `http://${localhost}:3000`; // Points to 'web' app