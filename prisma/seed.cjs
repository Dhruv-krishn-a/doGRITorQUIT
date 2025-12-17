// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding products/features...");

  const proFeature = await prisma.feature.upsert({
    where: { key: "AI_PLAN" },
    update: {},
    create: {
      key: "AI_PLAN",
      description: "AI plan generation access",
    },
  });

  const maxPlansFeature = await prisma.feature.upsert({
    where: { key: "MAX_PLANS" },
    update: {},
    create: {
      key: "MAX_PLANS",
      description: "Maximum number of plans allowed",
    },
  });

  // create PRO monthly product
  const pro = await prisma.product.upsert({
    where: { key: "PRO_MONTHLY" },
    update: {},
    create: {
      key: "PRO_MONTHLY",
      name: "Pro (Monthly)",
      description: "Pro monthly subscription",
      price: 19900, // 199.00 INR
      currency: "INR",
    },
  });

  const team = await prisma.product.upsert({
    where: { key: "TEAM_MONTHLY" },
    update: {},
    create: {
      key: "TEAM_MONTHLY",
      name: "Team (Monthly)",
      description: "Team monthly subscription",
      price: 49900, // 499.00 INR
      currency: "INR",
    },
  });

  // product features
  await prisma.productFeature.upsert({
    where: { productId_featureId: { productId: pro.id, featureId: proFeature.id } },
    update: {},
    create: {
      productId: pro.id,
      featureId: proFeature.id,
      value: { enabled: true },
    },
  });

  await prisma.productFeature.upsert({
    where: { productId_featureId: { productId: pro.id, featureId: maxPlansFeature.id } },
    update: {},
    create: {
      productId: pro.id,
      featureId: maxPlansFeature.id,
      value: { limit: 100 },
    },
  });

  await prisma.productFeature.upsert({
    where: { productId_featureId: { productId: team.id, featureId: proFeature.id } },
    update: {},
    create: {
      productId: team.id,
      featureId: proFeature.id,
      value: { enabled: true },
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await new PrismaClient().$disconnect().catch(() => {});
  });
