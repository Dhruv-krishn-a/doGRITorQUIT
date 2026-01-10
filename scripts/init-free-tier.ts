// scripts/init-free-tier.ts
// Run this with: npx tsx scripts/init-free-tier.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const freePlan = await prisma.product.upsert({
    where: { key: "FREE" },
    update: {},
    create: {
      name: "Free Tier",
      key: "FREE",
      description: "Default plan for new users",
      price: 0,
      currency: "INR",
      active: true,
    },
  });

  // Add the default feature to it
  const feature = await prisma.feature.upsert({
    where: { key: "AI_GEN_LIMIT" },
    update: {},
    create: { key: "AI_GEN_LIMIT", description: "Monthly AI Generation Limit" },
  });

  await prisma.productFeature.upsert({
    where: {
      productId_featureId: { productId: freePlan.id, featureId: feature.id },
    },
    create: {
      productId: freePlan.id,
      featureId: feature.id,
      value: { value: 5 }, // Default to 5
    },
    update: {},
  });

  console.log("✅ Free Tier Product & Features Initialized!");
}

main();