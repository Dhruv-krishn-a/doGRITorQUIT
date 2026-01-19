import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { mySchema } from './schema'
// You will import your Models here later, e.g.:
// import Task from './model/Task'

// 1. Create Adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  // (You can add migrations here later)
  // migrations,
  // (JSI is faster, enable if you are on the new architecture)
  jsi: true, 
  onSetUpError: error => {
    console.error("Database failed to load", error)
  }
})

// 2. Instantiate Database
export const database = new Database({
  adapter,
  modelClasses: [
    // Task, // Add your models here as you create them
  ],
})