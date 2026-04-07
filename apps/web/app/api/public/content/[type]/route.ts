import { NextResponse } from "next/server";
import { cms, billing } from "@gritorquit/domain"; 
import { getServerUser } from "@/lib/auth-server"; 

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ type: string }> } 
) {
  try {
    const { type } = await params;
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || undefined;
    const locale = url.searchParams.get("locale") || undefined;

    if (slug) {
      const entry = await cms.getPublishedBySlug(type, slug, locale);
      
      if (!entry) return NextResponse.json(null, { status: 404 });

      if (entry.requiresTier) {
        const user = await getServerUser();
        const userId = user?.id;

        if (!userId) {
          return NextResponse.json({ entry, accessible: false });
        }

        // ✅ FIX: Use the correct function name 'fetchUserEntitlements'
        const ent = await billing.fetchUserEntitlements(userId);
        const tierReq = entry.requiresTier; 

        let accessible = false;
        
        // Use the safe 'productKey' property from the new entitlements structure
        const currentKey = ent.productKey || "";

        if (currentKey) {
           accessible = currentKey === tierReq || currentKey.includes("PRO") || currentKey.includes("TEAM");
        }
        
        // Fallback check
        if (!accessible && ent.tierFallback) {
          accessible = ent.tierFallback === tierReq || ent.tierFallback === "PRO" || ent.tierFallback === "TEAM";
        }

        return NextResponse.json({ entry, accessible });
      }

      return NextResponse.json({ entry, accessible: true });
    }

    const entries = await cms.listPublishedByType(type, locale);
    return NextResponse.json(entries);

  } catch (err) {
    console.error("/api/public/content error", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}