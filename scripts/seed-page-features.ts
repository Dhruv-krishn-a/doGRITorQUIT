import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PAGE_FEATURES = [
  { key: "ACCESS_TASKS", description: "Access to Tasks Page" },
  { key: "ACCESS_CHECKLIST", description: "Access to Daily Checklist" },
  { key: "ACCESS_ANALYTICS", description: "Access to Analytics Dashboard" },
  { key: "ACCESS_PLANS", description: "Access to AI Plans Page" },
];

async function main() {
  console.log("🔐 Seeding Page Access Features...");

  for (const feat of PAGE_FEATURES) {
    await prisma.feature.upsert({
      where: { key: feat.key },
      update: {},
      create: {
        key: feat.key,
        description: feat.description,
      },
    });
  }

  console.log("✅ Features created! Go to CMS -> Plans -> Manage Features to toggle them.");
}

main();