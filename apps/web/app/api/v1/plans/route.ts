// apps/web/app/api/v1/config/route.ts
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server"; 
import { getUserSyncPermission } from "@gritorquit/domain/billing/permissions"; // The dynamic function we discussed

export async function GET() {
  try {
    // 1. Verify User Session
    const user = await getServerUser();

    // 2. Handle Guest / Unauthenticated Users
    if (!user) {
      return NextResponse.json({
        isGuest: true,
        permissions: {
          canSync: false,    // Guests are always local-only
          maxTasks: 10,      // strict limit for guests
          localStorage: true // guests need local storage to do anything
        }
      });
    }

    // 3. Fetch Dynamic Permissions from DB (via Domain Layer)
    const permissions = await getUserSyncPermission(user.id);

    // 4. Return Config to Mobile App
    return NextResponse.json({
      isGuest: false,
      userId: user.id,
      email: user.email,
      permissions: {
        ...permissions,
        // You can add extra feature flags here safely
        betaFeatures: false 
      }
    });

  } catch (error) {
    console.error("[Config API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}