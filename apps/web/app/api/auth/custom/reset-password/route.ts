import { NextResponse } from "next/server";
import { resetPassword } from "@/app/actions/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token ?? "");
    const newPassword = String(body.newPassword ?? body.password ?? "");

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "invalid_request", message: "Token and new password are required" },
        { status: 400 }
      );
    }

    const result = await resetPassword(token, newPassword);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.success });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
