import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Backfill...');

  // 1. SYNC PLAN COUNTERS
  const plans = await prisma.plan.findMany({
    include: { tasks: true }
  });

  console.log(`Checking ${plans.length} plans...`);

  for (const plan of plans) {
    const total = plan.tasks.length;
    const completed = plan.tasks.filter(t => t.completed).length;
    
    // Avoid division by zero
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Only update if numbers are wrong
    if (plan.totalTasks !== total || plan.completedTasks !== completed) {
      await prisma.plan.update({
        where: { id: plan.id },
        data: {
          totalTasks: total,
          completedTasks: completed,
          progress: progress
        }
      });
    }
  }

  // 2. SYNC USER STATS
  const users = await prisma.user.findMany({
    include: { 
      plans: true, 
      tasks: true,
      habits: { where: { active: true } }
    }
  });

  console.log(`Checking ${users.length} users...`);

  for (const user of users) {
    const totalPlans = user.plans.length;
    const totalTasks = user.tasks.length;
    const completedTasks = user.tasks.filter(t => t.completed).length;
    const activeHabits = user.habits.length;

    // Upsert: Create if missing, Update if exists
    await prisma.userStats.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalPlans,
        totalTasks,
        completedTasks,
        activeHabits,
        lastActiveAt: new Date()
      },
      update: {
        totalPlans,
        totalTasks,
        completedTasks,
        activeHabits
      }
    });
  }

  console.log('✅ Backfill Complete!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
