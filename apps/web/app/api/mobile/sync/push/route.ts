import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth-server";

function isMissingPushSyncRpc(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("push_changes") && message.includes("does not exist");
}

export async function POST(request: Request) {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { changes?: unknown };
    if (!body || typeof body !== "object" || !("changes" in body)) {
      return NextResponse.json({ error: "Missing changes payload" }, { status: 400 });
    }

    const changesJson = JSON.stringify(body.changes ?? {});

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${authUser.id}, true)`;
      await tx.$executeRaw`SELECT push_changes(${changesJson}::jsonb)`;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mobile sync push error:", error);
    if (isMissingPushSyncRpc(error)) {
      return NextResponse.json(
        {
          error: "Sync backend not configured",
          code: "SYNC_RPC_NOT_CONFIGURED",
          detail: "Database function push_changes(jsonb) is missing.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
