import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { billing } from "@gritorquit/domain";

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deviceId = req.headers.get("x-device-id")?.trim();
  if (!deviceId || !/^[a-f0-9]{32,128}$/i.test(deviceId)) {
    return NextResponse.json({ error: "Missing or invalid device identifier" }, { status: 400 });
  }

  try {
    const token = await billing.generateOfflineToken(user.id, deviceId);
    return NextResponse.json({ token });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "OFFLINE_ACCESS_DISABLED") {
      return NextResponse.json({ error: "Your plan does not support offline access" }, { status: 403 });
    }
    console.error("Offline Token Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
