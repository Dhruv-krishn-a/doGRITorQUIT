// scripts/sync-tiers.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Syncing User Tiers with Active Subscriptions...");

  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        include: { product: true },
        orderBy: { currentPeriodEnd: "desc" },
        take: 1
      }
    }
  });

  for (const user of users) {
    const activeSub = user.subscriptions[0];
    
    // Determine what the tier SHOULD be
    const correctTierName = activeSub?.product?.name || "Free Tier";

    // Only update if different
    if (user.tier !== correctTierName) {
      console.log(`- Updating ${user.email}: "${user.tier}" -> "${correctTierName}"`);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { tier: correctTierName }
      });
    }
  }

  console.log("✅ Sync Complete!");
}

main();