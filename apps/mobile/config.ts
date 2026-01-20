import Constants from "expo-constants";

// 1. Dynamic Host Logic
// This automatically detects if you are running on LAN (192.168.x.x) or Localhost (127.0.0.1)
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(":")[0] || "localhost";

export const config = {
  // 2. Supabase Keys (From your .env)
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,

  // 3. Dynamic Backend URL
  // This ensures the phone connects to the right place automatically
  apiUrl: `http://${localhost}:3000`,
};