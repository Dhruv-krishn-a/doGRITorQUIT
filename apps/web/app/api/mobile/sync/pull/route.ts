import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth-server";

function isMissingPullSyncRpc(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("pull_changes") && message.includes("does not exist");
}

export async function POST(request: Request) {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { lastPulledAt?: number | null };
    const lastPulledAt = Number(body.lastPulledAt ?? 0);
    const normalizedLastPulledAt = Number.isFinite(lastPulledAt) ? Math.max(0, Math.floor(lastPulledAt)) : 0;

    const payload = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${authUser.id}, true)`;
      const rows = await tx.$queryRaw<Array<{ pull_changes: unknown }>>`
        SELECT pull_changes(${normalizedLastPulledAt})
      `;

      return rows[0]?.pull_changes ?? null;
    });

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid sync payload" }, { status: 500 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Mobile sync pull error:", error);
    if (isMissingPullSyncRpc(error)) {
      return NextResponse.json(
        {
          error: "Sync backend not configured",
          code: "SYNC_RPC_NOT_CONFIGURED",
          detail: "Database function pull_changes(bigint) is missing.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
