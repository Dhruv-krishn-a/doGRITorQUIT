import { database } from '../db';
import StudyUnit from '../db/models/StudyUnit';
import StudyTrack from '../db/models/StudyTrack';
import { Q } from '@nozbe/watermelondb';

export async function toggleUnitCompletion(unitId: string) {
  await database.write(async () => {
    const unit = await database.get<StudyUnit>('study_units').find(unitId);
    const newStatus = unit.status === 'DONE' ? 'PENDING' : 'DONE';
    
    await unit.update(u => {
      u.status = newStatus;
    });

    // Recalculate Track Progress
    const track = await database.get<StudyTrack>('study_tracks').find(unit.trackId);
    const allUnits = await database.get<StudyUnit>('study_units')
      .query(Q.where('track_id', track.id))
      .fetch();
    
    const doneUnits = allUnits.filter(u => u.status === 'DONE').length;
    const progress = Math.round((doneUnits / allUnits.length) * 100);

    await track.update(t => {
      t.progressPercentage = progress;
    });
  });
}

export async function createTrack(title: string, type: 'PLAYLIST' | 'COURSE' | 'PROJECT') {
  return await database.write(async () => {
    return await database.get<StudyTrack>('study_tracks').create(t => {
      t.title = title;
      t.type = type;
      t.status = 'ACTIVE';
      t.progressPercentage = 0;
      t.userId = 'default';
    });
  });
}

export async function addUnitToTrack(trackId: string, title: string, order: number, duration: number = 25) {
  await database.write(async () => {
    await database.get<StudyUnit>('study_units').create(u => {
      u.trackId = trackId;
      u.title = title;
      u.status = 'PENDING';
      u.orderIndex = order;
      u.durationMinutes = duration;
    });
  });
}
