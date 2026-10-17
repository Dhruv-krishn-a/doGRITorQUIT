import { NextResponse } from "next/server";
import { registerWithVerification } from "@/lib/register-with-verification";
import { authRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    try {
      const { success } = await authRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 },
        );
      }
    } catch (err) {
      console.warn("Auth Rate limit check failed:", err);
    }

    const { email, password, name } = await req.json();
    const result = await registerWithVerification({ email, password, name });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: result.message,
        redirect: result.redirectedTo ?? "/auth/verify-request",
      },
      { status: result.status },
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
