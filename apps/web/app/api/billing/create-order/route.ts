import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { payment } from "@domain"; 

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // ✅ FIX 1: Pass 'user.id' (string), not the full user object
    const result = await payment.createCheckoutOrder(user.id, body.productKey);

    return NextResponse.json(result);
  } catch (err) {
    // ✅ FIX 2: Remove 'any' and handle safe error extraction
    console.error("[create-order]", err);
    
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}