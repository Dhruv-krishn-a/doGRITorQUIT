// apps/web/app/api/auth/sync-user/route.ts
import { NextResponse } from "next/server";
import { ensureUserExists } from "@/lib/ensureUserExists"; 
import { getServerUser } from "@/lib/auth-server";

type SyncUser = { id: string; email: string; name?: string | null; avatarUrl?: string | null };

const SYNC_TTL_MS = 30 * 1000; // 30s
const syncCache = new Map<string, { user: SyncUser; expiresAt: number }>();

export async function POST() {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.id;
    const userEmail = authUser.email ?? undefined;
    const userName = undefined;
    const userAvatar = undefined;

    if (!userEmail) {
      return NextResponse.json({ ok: false, error: "User email not found" }, { status: 400 });
    }

    // Return cached entry if recently synced
    const cached = syncCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ ok: true, user: cached.user, cached: true }, { status: 200 });
    }

    // ✅ Ensure user exists in DB (create or update), passing the avatar
    const persisted = await ensureUserExists(userId, userEmail, userName, userAvatar);

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
