// apps/web/app/api/auth/sync-user/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureUserExists } from "@/lib/ensureUserExists"; // change to relative import if your alias isn't configured

type SyncUser = { id: string; email: string; name?: string | null };

const SYNC_TTL_MS = 30 * 1000; // 30s
const syncCache = new Map<string, { user: SyncUser; expiresAt: number }>();

export async function POST() {
  try {
    // Await cookies() to get the RequestCookies object in this environment
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // read cookies from the request context
          getAll() {
            return cookieStore.getAll();
          },
          // no-op: this route doesn't write cookies (keeps behavior safe in server-only contexts)
          setAll() {
            /* no-op */
          },
        },
      }
    );

    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();

    if (sessionErr) {
      console.warn("sync-user: supabase getSession error:", sessionErr);
      return NextResponse.json({ ok: false, error: "Failed to read session" }, { status: 401 });
    }

    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUser = session.user;
    const userId = supabaseUser.id;
    const userEmail = supabaseUser.email;
    const userName = supabaseUser.user_metadata?.name ?? undefined;

    if (!userEmail) {
      return NextResponse.json({ ok: false, error: "User email not found" }, { status: 400 });
    }

    // Return cached entry if recently synced
    const cached = syncCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ ok: true, user: cached.user, cached: true }, { status: 200 });
    }

    // Ensure user exists in DB (create or update)
    const persisted = await ensureUserExists(userId, userEmail, userName);

    const safeUser: SyncUser = {
      id: persisted.id,
      email: persisted.email,
      name: persisted.name ?? null,
    };

    // Cache a sanitized user shape for a short period to avoid repeated upserts
    syncCache.set(userId, { user: safeUser, expiresAt: Date.now() + SYNC_TTL_MS });

    return NextResponse.json({ ok: true, user: safeUser }, { status: 200 });
  } catch (err) {
    console.error("sync-user route error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
