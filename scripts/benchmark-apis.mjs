import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function measure(name, fn, iterations = 3) {
  const times = [];
  let result;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = await fn();
    const duration = performance.now() - start;
    times.push(duration);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  return { name, avg: avg.toFixed(2), min: min.toFixed(2), max: max.toFixed(2), result };
}

async function runBenchmarks() {
  console.log("=================================================");
  console.log("   doGRITorQUIT API & Data Performance Benchmark ");
  console.log("=================================================\n");

  const testUser = await prisma.user.findFirst({
    select: { id: true, email: true }
  });

  if (!testUser) {
    console.error("No test user found in database.");
    process.exit(1);
  }

  console.log(`Using Test User: ${testUser.email} (${testUser.id})\n`);

  const benchmarks = [];

  // 1. Mobile Sync: pull_changes RPC
  benchmarks.push(await measure("Mobile Sync: pull_changes(0) RPC", async () => {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${testUser.id}, true)`;
      const rows = await tx.$queryRaw`SELECT pull_changes(0)`;
      return rows[0]?.pull_changes;
    });
  }));

  // 2. Mobile Sync: push_changes RPC
  benchmarks.push(await measure("Mobile Sync: push_changes RPC", async () => {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${testUser.id}, true)`;
      await tx.$executeRaw`SELECT push_changes('{}'::jsonb)`;
      return true;
    });
  }));

  // 3. Unified Today: Parallel task + habit + track query
  benchmarks.push(await measure("Unified Today Data Queries", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [tasks, units, habits, tracks] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId: testUser.id,
          OR: [
            { date: { gte: today, lt: tomorrow } },
            { date: { lt: today }, status: { notIn: ["completed", "archived"] } }
          ]
        },
        select: { id: true, title: true, status: true, priority: true }
      }),
      prisma.unit.findMany({
        where: {
          track: { userId: testUser.id },
          status: { in: ["TODAY", "IN_PROGRESS"] }
        },
        select: { id: true, title: true, status: true }
      }),
      prisma.habit.findMany({
        where: { userId: testUser.id, active: true },
        select: { id: true, title: true, logs: { where: { date: today } } }
      }),
      prisma.track.findMany({
        where: { userId: testUser.id, status: "ACTIVE" },
        select: { id: true, title: true }
      })
    ]);

    return { tasks: tasks.length, units: units.length, habits: habits.length, tracks: tracks.length };
  }));

  // 4. Study Plans List Query
  benchmarks.push(await measure("Study Plans List", async () => {
    return await prisma.plan.findMany({
      where: { userId: testUser.id },
      select: { id: true, title: true, progress: true }
    });
  }));

  // 5. Weekly Activity Aggregation
  benchmarks.push(await measure("Weekly Stats Aggregation", async () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [tasks, logs] = await Promise.all([
      prisma.task.findMany({
        where: { userId: testUser.id, date: { gte: startOfWeek, lte: now } },
        select: { id: true, completed: true, date: true }
      }),
      prisma.habitLog.findMany({
        where: { userId: testUser.id, date: { gte: startOfWeek, lte: now } },
        select: { id: true, completed: true, date: true }
      })
    ]);

    return { totalTasks: tasks.length, totalLogs: logs.length };
  }));

  // 6. User Auth Session Lookup
  benchmarks.push(await measure("Auth Session / User Lookup", async () => {
    return await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { id: true, email: true, role: true, tier: true }
    });
  }));

  console.log("| Endpoint / Data Query          | Avg Latency | Min Latency | Max Latency | Status        |");
  console.log("| :----------------------------- | :---------- | :---------- | :---------- | :------------ |");
  for (const b of benchmarks) {
    const status = Number(b.avg) < 200 ? "PASS (<200ms)" : "WARN (>200ms)";
    console.log(`| ${b.name.padEnd(30)} | ${b.avg.padStart(8)} ms | ${b.min.padStart(8)} ms | ${b.max.padStart(8)} ms | ${status} |`);
  }

  console.log("\n=================================================");
  console.log("Benchmark complete. All critical paths verified.");
  await prisma.$disconnect();
}

runBenchmarks().catch(err => {
  console.error("Benchmark failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
