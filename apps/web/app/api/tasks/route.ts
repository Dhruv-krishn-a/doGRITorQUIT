import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server"; // ✅ New Auth Server Helper
import { getAllTasksForUser } from "@planner/domain/plans/service"; // ✅ Correct import

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await getAllTasksForUser(user.id);
    
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET Tasks Error:", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}