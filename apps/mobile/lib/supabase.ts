import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 1. Read variables (Expo automatically injects EXPO_PUBLIC_ variables)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 2. Debugging: Log to terminal to verify they are loaded
console.log("Supabase URL:", supabaseUrl); 

// 3. Prevent crash if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase Environment Variables! Check apps/mobile/.env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});