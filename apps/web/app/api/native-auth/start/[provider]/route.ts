import { NextResponse } from "next/server";
import { sanitizeNativeRedirectUri } from "@/lib/native-redirect";
import { signIn } from "@/lib/auth";

const allowedProviders = new Set(["google", "github"]);
const hasProviderConfig = (provider: string) => {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === "github") {
    return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  }
  return false;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!allowedProviders.has(provider)) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  if (!hasProviderConfig(provider)) {
    return NextResponse.json(
      { error: `${provider} OAuth is not configured on server` },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const redirectUri = sanitizeNativeRedirectUri(url.searchParams.get("redirect_uri"));

  if (!redirectUri) {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  const callback = new URL("/api/native-auth/callback", url.origin);
  callback.searchParams.set("redirect_uri", redirectUri);
  callback.searchParams.set("provider", provider);

  await signIn(provider, { redirectTo: callback.toString() });
  
  // signIn should throw a redirect, but just in case it returns a response:
  return NextResponse.json({ error: "Failed to redirect to provider" }, { status: 500 });
}
