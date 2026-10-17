import { database } from "../db";
import { synchronize, SyncDatabaseChangeSet } from "@nozbe/watermelondb/sync";
import {
  getAccessToken,
  getApiBaseUrl,
  refreshSession,
} from "@/lib/nativeAuth";

let inFlightSync: Promise<void> | null = null;

function throwSyncError(
  payload: { error?: string; code?: string },
  fallbackMessage: string,
): never {
  const err = new Error(payload.error ?? fallbackMessage) as Error & {
    code?: string;
  };
  if (payload.code) {
    err.code = payload.code;
  }
  throw err;
}

async function getValidToken(): Promise<string> {
  let token = await getAccessToken();
  if (!token) {
    const refreshed = await refreshSession().catch(() => null);
    token = refreshed?.access_token ?? null;
  }
  if (!token) {
    throw new Error("Not authenticated");
  }
  return token;
}

async function runWatermelonSync(): Promise<void> {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      console.log(`[Sync] Pulling changes since ${lastPulledAt}`);

      let token = await getValidToken();

      let response = await fetch(`${getApiBaseUrl()}/api/mobile/sync/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lastPulledAt: lastPulledAt ?? 0,
        }),
      });

      // Handle token expiration during sync
      if (response.status === 401) {
        console.log("[Sync] Token expired during pull, refreshing session...");
        const refreshed = await refreshSession().catch(() => null);
        if (refreshed?.access_token) {
          token = refreshed.access_token;
          response = await fetch(`${getApiBaseUrl()}/api/mobile/sync/pull`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              lastPulledAt: lastPulledAt ?? 0,
            }),
          });
        }
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        throwSyncError(payload, "Sync pull failed");
      }

      const data = (await response.json()) as {
        changes: SyncDatabaseChangeSet;
        timestamp: number;
      };
      console.log(
        `[Sync] Received changes:`,
        JSON.stringify(data.changes).substring(0, 500),
      );

      return {
        changes: data.changes,
        timestamp: data.timestamp,
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log("[Sync] Pushing changes...");

      let token = await getValidToken();

      let response = await fetch(`${getApiBaseUrl()}/api/mobile/sync/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          changes,
          lastPulledAt: lastPulledAt ?? 0,
        }),
      });

      if (response.status === 401) {
        console.log("[Sync] Token expired during push, refreshing session...");
        const refreshed = await refreshSession().catch(() => null);
        if (refreshed?.access_token) {
          token = refreshed.access_token;
          response = await fetch(`${getApiBaseUrl()}/api/mobile/sync/push`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              changes,
              lastPulledAt: lastPulledAt ?? 0,
            }),
          });
        }
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        throwSyncError(payload, "Sync push failed");
      }
    },
  });
}

export async function performSyncOnce(): Promise<void> {
  if (inFlightSync) {
    return inFlightSync;
  }

  inFlightSync = runWatermelonSync().finally(() => {
    inFlightSync = null;
  });

  return inFlightSync;
}

export async function performSync(userTier: "FREE" | "PRO") {
  // 1. THE GATEKEEPER CHECK
  if (userTier === "FREE") {
    console.log(
      "🔒 User is Free tier. Skipping Cloud Sync. Data is local only.",
    );
    return { status: "skipped", reason: "upgrade_required" };
  }

  // 2. THE PRO SYNC (Only runs if Pro)
  await performSyncOnce();

  return { status: "success" };
}
