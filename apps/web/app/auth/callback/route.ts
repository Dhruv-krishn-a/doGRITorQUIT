import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureUserExists } from "@/lib/ensureUserExists";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  
  // Default redirect
  let next = searchParams.get("next") ?? "/dashboard";

  // ✅ FAILSAFE: If this is a password recovery flow, FORCE the redirect 
  // to the update page, even if the 'next' param is missing.
  if (type === "recovery") {
    next = "/auth/update-password";
  }

  if (code) {
    const cookieStore = await cookies();
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
              // Server component ignored
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // ✅ SYNC LOGIC: Ensure user exists in Postgres immediately
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email) {
        const name = user.user_metadata?.name || user.user_metadata?.full_name;
        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        
        console.log(`[Auth Callback] Syncing user: ${user.id} | Type: ${type || 'login'}`);
        
        try {
          await ensureUserExists(user.id, user.email, name, avatar);
        } catch (err) {
          console.error("[Auth Callback] Sync Error:", err);
          // We don't block the login, just log the sync failure
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}