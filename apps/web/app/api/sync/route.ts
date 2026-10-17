import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth-server";

function isMissingSyncRpc(error: unknown, fnName: string) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes(fnName) && message.includes("does not exist");
}

export async function GET(request: Request) {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lastPulledParam = searchParams.get("lastPulledAt");
    const lastPulledAt =
      lastPulledParam && lastPulledParam !== "null"
        ? Number(lastPulledParam)
        : 0;
    const normalizedLastPulledAt = Number.isFinite(lastPulledAt)
      ? Math.max(0, Math.floor(lastPulledAt))
      : 0;

    const payload = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${authUser.id}, true)`;
      const rows = await tx.$queryRaw<Array<{ pull_changes: unknown }>>`
        SELECT pull_changes(${normalizedLastPulledAt})
      `;
      return rows[0]?.pull_changes ?? null;
    });

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Invalid sync payload" },
        { status: 500 },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/sync pull error:", error);
    if (isMissingSyncRpc(error, "pull_changes")) {
      return NextResponse.json(
        {
          error: "Sync backend not configured",
          code: "SYNC_RPC_NOT_CONFIGURED",
          detail: "Database function pull_changes(bigint) is missing.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    // Case 1: Pull request via POST
    if ("lastPulledAt" in body && !("changes" in body)) {
      const lastPulledAt = Number(body.lastPulledAt ?? 0);
      const normalizedLastPulledAt = Number.isFinite(lastPulledAt)
        ? Math.max(0, Math.floor(lastPulledAt))
        : 0;

      const payload = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${authUser.id}, true)`;
        const rows = await tx.$queryRaw<Array<{ pull_changes: unknown }>>`
          SELECT pull_changes(${normalizedLastPulledAt})
        `;
        return rows[0]?.pull_changes ?? null;
      });

      if (!payload || typeof payload !== "object") {
        return NextResponse.json(
          { error: "Invalid sync payload" },
          { status: 500 },
        );
      }

      return NextResponse.json(payload);
    }

    // Case 2: Push request via POST
    if (!("changes" in body)) {
      return NextResponse.json(
        { error: "Missing changes payload" },
        { status: 400 },
      );
    }

    const changesJson = JSON.stringify(body.changes ?? {});

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${authUser.id}, true)`;
      await tx.$executeRaw`SELECT push_changes(${changesJson}::jsonb)`;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/sync error:", error);
    if (
      isMissingSyncRpc(error, "push_changes") ||
      isMissingSyncRpc(error, "pull_changes")
    ) {
      return NextResponse.json(
        {
          error: "Sync backend not configured",
          code: "SYNC_RPC_NOT_CONFIGURED",
          detail: "Database function pull_changes or push_changes is missing.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
