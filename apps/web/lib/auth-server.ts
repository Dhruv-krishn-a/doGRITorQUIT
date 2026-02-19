// apps/web/lib/auth-server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function getServerUser() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const authHeader = headerList.get("authorization");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // If there's an Authorization header, use it to set the session for the client
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) return user;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}