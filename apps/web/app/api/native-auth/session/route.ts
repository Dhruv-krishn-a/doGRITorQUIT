import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signNativeAccessToken } from "@/lib/native-auth-token";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiresIn = 60 * 60 * 24 * 7;
  const accessToken = await signNativeAccessToken({
    sub: session.user.id,
    email: session.user.email ?? undefined,
    type: "native-access",
  }, expiresIn);

  return NextResponse.json({
    token_type: "bearer",
    access_token: accessToken,
    expires_in: expiresIn,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });
}
