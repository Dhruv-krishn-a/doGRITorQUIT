import { SignJWT, jwtVerify } from "jose";

const isProduction = process.env.NODE_ENV === "production";
const tokenSecret =
  process.env.AUTH_NATIVE_JWT_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (!isProduction ? "gritorquit-dev-native-token-secret-change-me" : undefined);

if (!process.env.AUTH_NATIVE_JWT_SECRET && !process.env.NEXTAUTH_SECRET) {
  if (isProduction) {
    console.warn("AUTH_NATIVE_JWT_SECRET/NEXTAUTH_SECRET is not configured. Native auth tokens are disabled in production.");
  } else {
    console.warn("Using development fallback secret for native auth tokens. Set NEXTAUTH_SECRET or AUTH_NATIVE_JWT_SECRET.");
  }
}

const secret = tokenSecret ? new TextEncoder().encode(tokenSecret) : null;

export type NativeTokenPayload = {
  sub: string;
  email?: string;
  type: "native-access" | "native-refresh";
};

export async function signNativeAccessToken(payload: NativeTokenPayload, expiresInSeconds = 60 * 60 * 1) { // 1 hour for access
  if (!secret) {
    throw new Error("Native token secret is not configured. Set NEXTAUTH_SECRET or AUTH_NATIVE_JWT_SECRET.");
  }

  return await new SignJWT({ ...payload, type: "native-access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secret);
}

export async function signNativeRefreshToken(userId: string) {
  if (!secret) {
    throw new Error("Native token secret is not configured.");
  }

  // Refresh tokens last longer (e.g., 30 days)
  const expiresInSeconds = 60 * 60 * 24 * 30;

  return await new SignJWT({ sub: userId, type: "native-refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secret);
}

export async function verifyNativeToken(token: string, type: "native-access" | "native-refresh"): Promise<NativeTokenPayload | null> {
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== type || !payload.sub) {
      return null;
    }

    return {
      sub: String(payload.sub),
      email: payload.email ? String(payload.email) : undefined,
      type: type as any,
    };
  } catch {
    return null;
  }
}

export async function verifyNativeAccessToken(token: string): Promise<NativeTokenPayload | null> {
  return verifyNativeToken(token, "native-access");
}

export async function verifyNativeRefreshToken(token: string): Promise<NativeTokenPayload | null> {
  return verifyNativeToken(token, "native-refresh");
}
