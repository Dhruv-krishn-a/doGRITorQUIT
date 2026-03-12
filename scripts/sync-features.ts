import { prisma } from "../packages/db";
import { PlanFeature } from "../packages/domain/billing/entitlements";

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  [PlanFeature.ACCESS_PLANS]: "Unlocks AI-driven Roadmaps and planning features.",
  [PlanFeature.ACCESS_TODAY]: "Unlocks the unified 'Today' view for daily tasks.",
  [PlanFeature.ACCESS_HABITS]: "Unlocks Habits tracking and the Daily Checklist.",
  [PlanFeature.ACCESS_STUDY]: "Master switch for the 'Upgrade OS' study section.",
  [PlanFeature.ACCESS_STUDY_YOUTUBE]: "Allows tracking and progress on YouTube playlists.",
  [PlanFeature.ACCESS_STUDY_COURSE]: "Allows tracking for online courses and certifications.",
  [PlanFeature.ACCESS_STUDY_PROJECT]: "Allows tracking for complex learning projects.",
  [PlanFeature.ACCESS_ANALYTICS]: "Unlocks the basic productivity analytics dashboard.",
  [PlanFeature.ACCESS_SPACED_REPETITION]: "Unlocks Spaced Repetition algorithms for study.",
  [PlanFeature.ACCESS_WEEKLY_REFLECTION]: "Unlocks weekly cognitive load and mood tools.",
  [PlanFeature.ACCESS_DAILY_JOURNAL]: "Unlocks the free-form daily journaling system.",
  [PlanFeature.ACCESS_ADVANCED_ANALYTICS]: "Unlocks deep insights and burnout risk analysis.",
  [PlanFeature.AI_GEN_LIMIT]: "Monthly AI generation credits (numeric).",
  [PlanFeature.MAX_PLANS]: "Maximum active roadmaps at any time (numeric).",
  [PlanFeature.MAX_PLAN_DAYS]: "Maximum days per AI-generated roadmap (numeric).",
  [PlanFeature.MAX_STUDY_YOUTUBE]: "Maximum active YouTube playlists (numeric).",
  [PlanFeature.MAX_STUDY_COURSES]: "Maximum active course tracks (numeric).",
  [PlanFeature.MAX_STUDY_PROJECTS]: "Maximum active project tracks (numeric).",
  [PlanFeature.MAX_VIDEOS_PER_PLAYLIST]: "Maximum videos allowed per playlist import (numeric).",
  [PlanFeature.MAX_HABITS_TRACKED]: "Maximum active habits tracked simultaneously (numeric).",
};

async function main() {
  console.log("🚀 Syncing Plan Features...");

  const features = Object.values(PlanFeature);
  
  for (const key of features) {
    const description = FEATURE_DESCRIPTIONS[key] || "System feature";
    
    await prisma.feature.upsert({
      where: { key },
      create: { key, description },
      update: { description }
    });
    
    console.log(`✅ Synced: ${key}`);
  }

  console.log("✨ All features synced successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
