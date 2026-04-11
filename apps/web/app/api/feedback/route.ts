import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { sendFeedbackEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, platform, type, metadata } = await req.json();

    if (!message || !platform || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendFeedbackEmail({
      email: user.email || "unknown@user.com",
      message,
      platform,
      type,
      metadata
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Feedback API Error]:", err);
    return NextResponse.json({ error: "Failed to transmit signal" }, { status: 500 });
  }
}
