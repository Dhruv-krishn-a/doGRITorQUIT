import { createClient } from '@supabase/supabase-js';
import { load, type Store } from '@tauri-apps/plugin-store';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing from environment variables.");
}

// Custom storage for Tauri to use native secure storage or at least a persistent store
// instead of just browser localStorage which can be cleared easily.
const isTauri = '__TAURI_INTERNALS__' in window;
let storeInstance: Store | null = null;

async function getStore() {
  if (storeInstance) return storeInstance;
  try {
    storeInstance = await load('settings.json');
    return storeInstance;
  } catch (e) {
    console.error("Failed to load store:", e);
    return null;
  }
}

const customStorage = {
  getItem: (key: string) => {
    if (!isTauri) return localStorage.getItem(key);
    return getStore().then(store => store ? store.get<string>(key) : null);
  },
  setItem: (key: string, value: string) => {
    if (!isTauri) {
      localStorage.setItem(key, value);
      return;
    }
    getStore().then(async store => {
      if (store) {
        await store.set(key, value);
        await store.save();
      }
    });
  },
  removeItem: (key: string) => {
    if (!isTauri) {
      localStorage.removeItem(key);
      return;
    }
    getStore().then(async store => {
      if (store) {
        await store.delete(key);
        await store.save();
      }
    });
  }
};

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: customStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
