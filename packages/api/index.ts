import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient(url: string, anon: string) {
  return createClient(url, anon);
}
