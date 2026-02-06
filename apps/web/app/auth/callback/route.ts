//apps/web/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureUserExists } from "@/lib/ensureUserExists"; // ✅ Import Sync Logic

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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
      // ✅ FIX: Sync user to Database IMMEDIATELY before redirecting
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email) {
        // Extract metadata for profile
        const name = user.user_metadata?.name || user.user_metadata?.full_name;
        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        
        console.log("Creating user in DB via Callback:", user.id);
        
        try {
          await ensureUserExists(user.id, user.email, name, avatar);
        } catch (err) {
          console.error("Callback Sync Error:", err);
          // We don't block the login even if sync fails, but we log it
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}