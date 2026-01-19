import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'is_completed', type: 'boolean' },
        { name: 'created_at', type: 'number' }, // Timestamps for sync
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'plans',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'progress', type: 'number' },
      ]
    }),
  ]
})