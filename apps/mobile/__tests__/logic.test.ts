import { jest, describe, it, expect } from '@jest/globals';

// Mock WatermelonDB
jest.mock('../db', () => ({
  database: {
    write: jest.fn((cb: any) => cb()),
    get: jest.fn(() => ({
      find: jest.fn(() => Promise.resolve({
        update: jest.fn(),
        status: 'PENDING'
      })),
      query: jest.fn(() => ({
        fetch: jest.fn(() => Promise.resolve([])),
      })),
      create: jest.fn(),
    })),
  },
}));

jest.mock('@nozbe/watermelondb', () => ({
  Q: {
    where: jest.fn(() => ({})),
  }
}));

import { completeVector } from '../lib/execution-logic';
import { database } from '../db';

describe('Execution Logic', () => {
  it('should attempt to complete a PROJECT task', async () => {
    const mockTask = {
      update: jest.fn(),
      completed: false,
      status: 'pending'
    };
    
    (database.get as jest.Mock).mockReturnValue({
      find: jest.fn<any>().mockResolvedValue(mockTask)
    });

    await completeVector('task-1', 'PROJECT', 'user-1');
    
    expect(mockTask.update).toHaveBeenCalled();
  });

  it('should handle HABIT logging', async () => {
    const mockHabitLogs = {
      query: jest.fn().mockReturnThis(),
      fetch: jest.fn<any>().mockResolvedValue([]),
      create: jest.fn()
    };

    (database.get as any).mockImplementation((table: string) => {
      if (table === 'habit_logs') return mockHabitLogs;
      return {};
    });

    await completeVector('habit-1', 'HABIT', 'user-1');
    expect(mockHabitLogs.create).toHaveBeenCalled();
  });
});
