import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { payment } from "@domain"; 

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await payment.getUserSubscription(user.id);
    
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[billing/subscription] ", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}