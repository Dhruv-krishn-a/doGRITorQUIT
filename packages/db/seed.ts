import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ===========================================
  // 1. SYSTEM FEATURES (The "Knobs" for your App)
  // ===========================================
  console.log('⚙️  Seeding Features...')
  
  const featuresList = [
    // Access Gates (Boolean)
    { key: 'ACCESS_TODAY', description: 'Access unified Today dashboard' },
    { key: 'ACCESS_HABITS', description: 'Track daily habits' },
    { key: 'ACCESS_DAILY_JOURNAL', description: 'Write daily notes and journal entries' },
    { key: 'ACCESS_ANALYTICS', description: 'View productivity statistics' },
    { key: 'THEME_CUSTOMIZATION', description: 'Dark/Light mode and custom colors' },
    
    // Limits (Numeric)
    { key: 'AI_GEN_LIMIT', description: 'Daily AI generation credits' },
    { key: 'MAX_PLANS', description: 'Maximum active projects/plans' },
    { key: 'MAX_FILE_SIZE', description: 'Max file upload size in MB' },
  ];

  const featureMap = new Map<string, string>();

  for (const f of featuresList) {
    const feature = await prisma.feature.upsert({
      where: { key: f.key },
      create: f,
      update: f,
    });
    featureMap.set(f.key, feature.id);
  }

  // ===========================================
  // 2. PRODUCTS (The "Tiers")
  // ===========================================
  console.log('📦 Seeding Products...')

  // --- A. FREE TIER ---
  const freeProduct = await prisma.product.upsert({
    where: { key: 'FREE' },
    create: {
      name: 'Free Tier',
      key: 'FREE',
      price: 0,
      description: 'The starter plan for individuals',
      active: true,
      currency: 'INR'
    },
    update: {},
  });

  // Configure Free Tier
  const freeConfig = [
    { key: 'ACCESS_TODAY', value: { enabled: true } },
    { key: 'ACCESS_HABITS', value: { enabled: true } },
    { key: 'ACCESS_DAILY_JOURNAL', value: { enabled: false } }, // Locked
    { key: 'ACCESS_ANALYTICS', value: { enabled: false } }, // Locked
    { key: 'AI_GEN_LIMIT', value: 5 },  // 5 Credits
    { key: 'MAX_PLANS', value: 1 },     // 1 Plan only
  ];

  for (const item of freeConfig) {
    await prisma.productFeature.upsert({
      where: { productId_featureId: { productId: freeProduct.id, featureId: featureMap.get(item.key)! } },
      create: { productId: freeProduct.id, featureId: featureMap.get(item.key)!, value: item.value },
      update: { value: item.value },
    });
  }

  // --- B. PRO PLAN ---
  const proProduct = await prisma.product.upsert({
    where: { key: 'PRO_MONTHLY' },
    create: {
      name: 'Pro Plan',
      key: 'PRO_MONTHLY',
      price: 49900, // 499.00 INR
      description: 'Unlock your full potential',
      active: true,
      currency: 'INR'
    },
    update: {},
  });

  // Configure Pro Tier
  const proConfig = [
    { key: 'ACCESS_TODAY', value: { enabled: true } },
    { key: 'ACCESS_HABITS', value: { enabled: true } },
    { key: 'ACCESS_DAILY_JOURNAL', value: { enabled: true } },
    { key: 'ACCESS_ANALYTICS', value: { enabled: true } },
    { key: 'THEME_CUSTOMIZATION', value: { enabled: true } },
    { key: 'AI_GEN_LIMIT', value: 100 }, // 100 Credits
    { key: 'MAX_PLANS', value: 999 },    // Unlimited
    { key: 'MAX_FILE_SIZE', value: 50 }, // 50MB
  ];

  for (const item of proConfig) {
    await prisma.productFeature.upsert({
      where: { productId_featureId: { productId: proProduct.id, featureId: featureMap.get(item.key)! } },
      create: { productId: proProduct.id, featureId: featureMap.get(item.key)!, value: item.value },
      update: { value: item.value },
    });
  }

  // ===========================================
  // 3. CMS CONTENT TYPES (For the Blog/Updates)
  // ===========================================
  console.log('📝 Seeding CMS Content Types...')

  await prisma.contentType.upsert({
    where: { key: 'blog_post' },
    create: {
      key: 'blog_post',
      name: 'Blog Post',
      schema: {
        fields: [
          { name: 'coverImage', type: 'image', required: false },
          { name: 'author', type: 'text', required: true },
          { name: 'tags', type: 'list', required: false }
        ]
      }
    },
    update: {},
  });

  await prisma.contentType.upsert({
    where: { key: 'changelog' },
    create: {
      key: 'changelog',
      name: 'Product Update',
      schema: {
        fields: [
          { name: 'version', type: 'text', required: true },
          { name: 'isMajor', type: 'boolean', required: true }
        ]
      }
    },
    update: {},
  });

  console.log('✅ Seed complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })