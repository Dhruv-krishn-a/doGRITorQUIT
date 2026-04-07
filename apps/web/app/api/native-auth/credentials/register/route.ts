import { NextResponse } from "next/server";
import { registerWithVerification } from "@/lib/register-with-verification";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    const email = String(body.email ?? "");
    const password = String(body.password ?? "");
    const name = String(body.name ?? "");

    const result = await registerWithVerification({ email, password, name });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        requires_email_verification: true,
        redirect: result.redirectedTo ?? "/auth/verify-request",
      },
      { status: result.status }
    );
  } catch (error) {
    console.error("Native credentials register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
