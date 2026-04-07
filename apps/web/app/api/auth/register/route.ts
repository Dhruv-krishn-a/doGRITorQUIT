import { NextResponse } from "next/server";
import { registerWithVerification } from "@/lib/register-with-verification";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const result = await registerWithVerification({ email, password, name });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { success: true, message: result.message, redirect: result.redirectedTo ?? "/auth/verify-request" },
      { status: result.status }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
