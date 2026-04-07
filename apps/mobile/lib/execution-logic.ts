import { database } from '../db';
import Task from '../db/models/Task';
import HabitLog from '../db/models/HabitLog';
import StudyUnit from '../db/models/StudyUnit';
import StudyTrack from '../db/models/StudyTrack';
import { Q } from '@nozbe/watermelondb';

export async function completeVector(id: string, type: 'HABIT' | 'YOUTUBE' | 'COURSE' | 'PROJECT', userId: string) {
  await database.write(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    if (type === 'HABIT') {
      const existing = await database.get<HabitLog>('habit_logs')
        .query(Q.where('habit_id', id), Q.where('date', todayTime))
        .fetch();
      
      if (existing.length === 0) {
        await database.get<HabitLog>('habit_logs').create(log => {
          log.habitId = id;
          log.userId = userId;
          log.date = todayTime;
          log.completed = true;
        });
      }
    } else if (type === 'YOUTUBE' || type === 'COURSE') {
      const unit = await database.get<StudyUnit>('study_units').find(id);
      await unit.update(u => {
        u.status = 'DONE';
      });

      // Recalculate track progress
      const track = await database.get<StudyTrack>('study_tracks').find(unit.trackId);
      const allUnits = await database.get<StudyUnit>('study_units')
        .query(Q.where('track_id', track.id))
        .fetch();
      const doneUnits = allUnits.filter(u => u.status === 'DONE').length;
      await track.update(t => {
        t.progressPercentage = Math.round((doneUnits / allUnits.length) * 100);
      });
    } else if (type === 'PROJECT') {
      const task = await database.get<Task>('tasks').find(id);
      await task.update(t => {
        t.completed = true;
        t.status = 'completed';
      });
    }
  });
}
