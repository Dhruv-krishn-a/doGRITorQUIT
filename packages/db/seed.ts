import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ===========================================
  // 1. SYSTEM FEATURES (The "Knobs" for your App)
  // ===========================================
  console.log('⚙️  Seeding Features...')
  
  const featuresList = [
    // Core Features
    { key: 'ACCESS_PLANS', description: 'Roadmaps Feature' },
    { key: 'ACCESS_TODAY', description: 'Access unified Today dashboard' },
    { key: 'ACCESS_HABITS', description: 'Track daily habits' },
    { key: 'ACCESS_DAILY_JOURNAL', description: 'Write daily notes and journal entries' },
    { key: 'ACCESS_NOTES', description: 'Notes Manager Access' },
    { key: 'ACCESS_ANALYTICS', description: 'View productivity statistics' },
    { key: 'ACCESS_ADVANCED_ANALYTICS', description: 'Advanced trends and burnout risk' },
    { key: 'THEME_CUSTOMIZATION', description: 'Dark/Light mode and custom colors' },
    { key: 'ACCESS_PDF_EXPORT', description: 'Export data to PDF' },

    // Study & Upgrade OS
    { key: 'ACCESS_STUDY', description: 'Main Upgrade OS access' },
    { key: 'ACCESS_STUDY_YOUTUBE', description: 'Track YouTube playlists' },
    { key: 'ACCESS_STUDY_COURSE', description: 'Track structured courses' },
    { key: 'ACCESS_STUDY_PROJECT', description: 'Track multi-phase projects' },
    { key: 'ACCESS_STUDY_AI_PLANNER', description: 'AI-driven study planner' },
    { key: 'ACCESS_SPACED_REPETITION', description: 'Spaced repetition scheduling' },
    { key: 'ACCESS_WEEKLY_REFLECTION', description: 'Weekly reflection tools' },

    // Sync & Offline
    { key: 'ACCESS_MOBILE_SYNC', description: 'Mobile App Sync' },
    { key: 'ACCESS_DESKTOP_SYNC', description: 'Desktop App Sync' },
    { key: 'ACCESS_OFFLINE_DB', description: 'Offline Local Database' },

    // Limits (Numeric)
    { key: 'AI_GEN_LIMIT', description: 'Daily AI generation credits' },
    { key: 'MAX_PLANS', description: 'Maximum active roadmaps' },
    { key: 'MAX_PLAN_DAYS', description: 'Max days per roadmap' },
    { key: 'MAX_HABITS_TRACKED', description: 'Max active habits' },
    { key: 'MAX_STUDY_YOUTUBE', description: 'YouTube playlist cap' },
    { key: 'MAX_STUDY_COURSES', description: 'Course enrollment cap' },
    { key: 'MAX_STUDY_PROJECTS', description: 'Project slots' },
    { key: 'MAX_VIDEOS_PER_PLAYLIST', description: 'Max videos per playlist' },
    { key: 'MAX_OFFLINE_DURATION_HOURS', description: 'Max offline hours' },
    { key: 'TOKEN_EXPIRY_HOURS', description: 'JWT Token Expiry (Hours)' },
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
    { key: 'ACCESS_NOTES', value: { enabled: false } }, 
    { key: 'ACCESS_DAILY_JOURNAL', value: { enabled: false } }, 
    { key: 'ACCESS_ANALYTICS', value: { enabled: false } }, 
    { key: 'ACCESS_STUDY', value: { enabled: false } }, 
    { key: 'ACCESS_MOBILE_SYNC', value: { enabled: true } }, 
    { key: 'ACCESS_DESKTOP_SYNC', value: { enabled: false } }, 
    { key: 'ACCESS_OFFLINE_DB', value: { enabled: false } }, 
    { key: 'AI_GEN_LIMIT', value: 5 },  
    { key: 'MAX_PLANS', value: 1 },     
    { key: 'MAX_HABITS_TRACKED', value: 3 },     
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
    { key: 'ACCESS_PLANS', value: { enabled: true } },
    { key: 'ACCESS_TODAY', value: { enabled: true } },
    { key: 'ACCESS_HABITS', value: { enabled: true } },
    { key: 'ACCESS_NOTES', value: { enabled: true } },
    { key: 'ACCESS_DAILY_JOURNAL', value: { enabled: true } },
    { key: 'ACCESS_ANALYTICS', value: { enabled: true } },
    { key: 'ACCESS_ADVANCED_ANALYTICS', value: { enabled: true } },
    { key: 'THEME_CUSTOMIZATION', value: { enabled: true } },
    { key: 'ACCESS_STUDY', value: { enabled: true } },
    { key: 'ACCESS_STUDY_YOUTUBE', value: { enabled: true } },
    { key: 'ACCESS_STUDY_COURSE', value: { enabled: true } },
    { key: 'ACCESS_STUDY_PROJECT', value: { enabled: true } },
    { key: 'ACCESS_STUDY_AI_PLANNER', value: { enabled: true } },
    { key: 'ACCESS_MOBILE_SYNC', value: { enabled: true } },
    { key: 'ACCESS_DESKTOP_SYNC', value: { enabled: true } },
    { key: 'ACCESS_OFFLINE_DB', value: { enabled: true } },
    { key: 'AI_GEN_LIMIT', value: 100 }, 
    { key: 'MAX_PLANS', value: 999 },    
    { key: 'MAX_HABITS_TRACKED', value: 50 },    
    { key: 'MAX_OFFLINE_DURATION_HOURS', value: 168 }, // 7 days
    { key: 'TOKEN_EXPIRY_HOURS', value: 720 }, // 30 days
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