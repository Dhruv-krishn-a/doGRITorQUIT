// packages/domain/study/service.test.ts
import { StudyService } from './service';
import { UnitType, UnitStatus, Effort } from '@prisma/client';

describe('StudyService Logic', () => {
  describe('calculateUnitWeight', () => {
    it('should calculate base weight for Effort levels', () => {
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'LOW' })).toBe(1);
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'MEDIUM' })).toBe(2);
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'HIGH' })).toBe(3);
    });

    it('should add weight for long duration (>60m)', () => {
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'MEDIUM', durationMinutes: 70 })).toBe(3);
    });

    it('should add weight for high difficulty (>=4)', () => {
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'MEDIUM', difficultyRating: 4 })).toBe(3);
    });

    it('should add weight for low confidence (<=2) if DONE', () => {
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'MEDIUM', confidenceRating: 2, status: 'DONE' })).toBe(3);
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'MEDIUM', confidenceRating: 2, status: 'BACKLOG' })).toBe(2);
    });

    it('should apply revision multiplier (0.75x)', () => {
      expect(StudyService.calculateUnitWeight({ estimatedEffort: 'MEDIUM', type: 'REVISION' })).toBe(1.5);
    });
  });

  describe('calculateStreak', () => {
    it('should calculate correct streak', () => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today.getTime() - 24*60*60*1000);
      const twoDaysAgo = new Date(today.getTime() - 2*24*60*60*1000);

      const sessions = [
        { date: today, cognitiveLoadScore: 5 },
        { date: yesterday, cognitiveLoadScore: 5 },
        { date: twoDaysAgo, cognitiveLoadScore: 5 },
      ];

      expect(StudyService.calculateStreak(sessions)).toBe(3);
    });

    it('should handle broken streaks', () => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const twoDaysAgo = new Date(today.getTime() - 2*24*60*60*1000);

      const sessions = [
        { date: today, cognitiveLoadScore: 5 },
        { date: twoDaysAgo, cognitiveLoadScore: 5 },
      ];

      expect(StudyService.calculateStreak(sessions)).toBe(1);
    });
  });
});
