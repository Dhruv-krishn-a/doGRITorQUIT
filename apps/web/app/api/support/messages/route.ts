import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; message?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const message = String(body.message ?? "").trim();

    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
    }

    const authUser = await getServerUser();

    await prisma.supportMessage.create({
      data: {
        email,
        message,
        userId: authUser?.id ?? null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support message submission failed:", error);
    return NextResponse.json(
      { error: "Could not submit support message right now" },
      { status: 500 }
    );
  }
}
