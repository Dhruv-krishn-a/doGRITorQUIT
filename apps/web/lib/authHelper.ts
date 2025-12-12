//apps/web/lib/authHelper.ts
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Helper: always resolve cookies() even if it returns a Promise
async function getCookieStore() {
  const result = nextCookies();
  return result instanceof Promise ? await result : result;
}

export async function createSupabaseServerClient() {
  const cookieStore = await getCookieStore();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignored (Next.js may block cookie writes depending on context)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // ignored
          }
        },
      },
    }
  );
}

export async function getServerUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch (err) {
    console.error("getServerUserId error:", err);
    return null;
  }
}

export async function getServerUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch (err) {
    console.error("getServerUser error:", err);
    return null;
  }
}
