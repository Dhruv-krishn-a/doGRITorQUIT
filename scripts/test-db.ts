
import { prisma } from '../packages/db/index';

async function main() {
  try {
    console.log("Testing DB connection and schema...");
    const tracks = await prisma.track.findMany({
      include: {
        units: {
          select: { 
            id: true, 
            todayGoalMinutes: true 
          },
          take: 1
        }
      },
      take: 1
    });
    console.log("Successfully fetched tracks and units with todayGoalMinutes");
    console.log(JSON.stringify(tracks, null, 2));
  } catch (error) {
    console.error("DB Test Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
