import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { billing } from "@domain";

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // We could extract a real Device ID from headers if needed, 
  // but for now we use a generic placeholder or user-agent fingerprint.
  const userAgent = req.headers.get("user-agent") || "unknown-desktop";
  const deviceId = `dev_${Buffer.from(userAgent).toString("hex").substring(0, 12)}`;

  try {
    const token = await billing.generateOfflineToken(user.id, deviceId);
    return NextResponse.json({ token });
  } catch (error: any) {
    if (error.message === "OFFLINE_ACCESS_DISABLED") {
      return NextResponse.json({ error: "Your plan does not support offline access" }, { status: 403 });
    }
    console.error("Offline Token Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
