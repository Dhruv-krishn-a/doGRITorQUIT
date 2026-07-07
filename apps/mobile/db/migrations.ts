import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations'

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'notes',
          columns: [
            { name: 'metadata', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
})
