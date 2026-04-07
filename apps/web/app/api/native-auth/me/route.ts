import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const getNativeSecret = () => {
  const secret = process.env.AUTH_NATIVE_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_NATIVE_JWT_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = getNativeSecret();
    
    let payload;
    try {
      const result = await jwtVerify(token, secret);
      payload = result.payload;
    } catch (e) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = payload.sub;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.profile?.name,
      user_metadata: {
        full_name: user.profile?.name,
        avatar_url: user.profile?.avatarUrl,
      }
    });

  } catch (error) {
    console.error("Native me API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
