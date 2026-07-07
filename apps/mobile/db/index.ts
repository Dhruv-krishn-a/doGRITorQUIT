import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { mySchema } from './schema'
import { migrations } from './migrations'
import Task from './models/Task'
import Habit from './models/Habit'
import HabitLog from './models/HabitLog'
import StudyTrack from './models/StudyTrack'
import StudyUnit from './models/StudyUnit'
import Note from './models/Note'

// 1. Create Adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  migrations,
  // Avoid hard crash on runtimes where native JSI sqlite module isn't available.
  // WatermelonDB will use asynchronous bridge mode instead.
  jsi: false,
  onSetUpError: error => {
    console.error("Database failed to load", error)
  }
})

// 2. Instantiate Database
export const database = new Database({
  adapter,
  modelClasses: [
    Task,
    Habit,
    HabitLog,
    StudyTrack,
    StudyUnit,
    Note,
  ],
})
