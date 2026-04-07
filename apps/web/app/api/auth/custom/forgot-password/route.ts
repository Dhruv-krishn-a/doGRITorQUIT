import { NextResponse } from "next/server";
import { forgotPassword } from "@/app/actions/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const result = await forgotPassword(email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.success });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
