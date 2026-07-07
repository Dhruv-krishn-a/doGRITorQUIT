import { StudyService } from '../packages/domain/study/service.ts';

function test() {
  console.log("--- UPGRADE OS LOGIC VERIFICATION ---");

  const testCases = [
    {
      name: "Standard Unit (Medium, 30m, 100%)",
      unit: { estimatedEffort: 'MEDIUM', durationMinutes: 30, difficultyRating: 3, watchPercentage: 100 }
    },
    {
      name: "Heavy Unit (High, 70m, 50% Watch) - Test Multiplier",
      unit: { estimatedEffort: 'HIGH', durationMinutes: 70, difficultyRating: 5, watchPercentage: 50 }
    },
    {
      name: "Heavy Unit (High, 70m, 100% Watch) - Base for Comparison",
      unit: { estimatedEffort: 'HIGH', durationMinutes: 70, difficultyRating: 5, watchPercentage: 100 }
    },
    {
      name: "Revision Bonus (Medium, 30m, 100%, type REVISION)",
      unit: { estimatedEffort: 'MEDIUM', durationMinutes: 30, difficultyRating: 3, watchPercentage: 100, type: 'REVISION' }
    },
    {
      name: "Minimal Watch (High, 10%) - Should floor at 0.5",
      unit: { estimatedEffort: 'HIGH', durationMinutes: 30, difficultyRating: 3, watchPercentage: 10 }
    }
  ];

  testCases.forEach(tc => {
    const weight = StudyService.calculateUnitWeight(tc.unit);
    const xp = weight * 100;
    console.log(`Case: ${tc.name}`);
    console.log(`Result: Weight ${weight} | XP ${xp}`);
    console.log("-----------------------------------");
  });
}

test();
