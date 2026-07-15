import { prisma } from "@gritorquit/db";

const tableModelMap = {
  tasks: "task",
  subtasks: "subtask",
  habits: "habit",
  habit_logs: "habitLog",
  study_tracks: "track",
  study_units: "unit",
  unit_sessions: "unitSession",
  notes: "note",
};

const safeParse = (val: any) => {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch (e) { return null; }
};

const safeStringify = (val: any) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  try { return JSON.stringify(val); } catch (e) { return null; }
};

const mapToPrisma = (tableName: string, userId: string, record: any) => {
  const base = { id: record.id };
  const baseWithUser = { ...base, userId };
  
  switch (tableName) {
    case 'tasks':
      return {
        ...baseWithUser,
        title: record.title,
        description: record.description,
        completed: record.completed === 1 || record.completed === true,
        status: record.status,
        priority: record.priority || null,
        date: record.date ? new Date(record.date) : null,
        dueDate: record.due_date ? new Date(record.due_date) : null,
        planId: record.plan_id || null,
        estimatedMinutes: record.estimated_minutes || null,
        timeSpentMinutes: record.time_spent_minutes || 0,
        metadata: safeParse(record.metadata),
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
        updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
      };
    case 'subtasks':
      return {
        ...base,
        taskId: record.task_id,
        title: record.title,
        completed: record.completed === 1 || record.completed === true,
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
        updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
      };
    case 'habits':
      return {
        ...baseWithUser,
        title: record.title,
        icon: record.icon,
        color: record.color,
        active: record.active === 1 || record.active === true,
        order: record.order || 0,
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
        updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
      };
    case 'habit_logs':
      return {
        ...baseWithUser,
        habitId: record.habit_id,
        date: record.date ? new Date(record.date) : new Date(),
        completed: record.completed === 1 || record.completed === true,
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
      };
    case 'study_tracks':
      return {
        ...baseWithUser,
        title: record.title,
        type: record.type,
        status: record.status,
        progressPercentage: record.progress_percentage || 0,
        dailyAllocationMinutes: record.daily_allocation_minutes || null,
        estimatedCompletionDate: record.estimated_completion_date ? new Date(record.estimated_completion_date) : null,
        remainingMinutes: record.remaining_minutes || 0,
        metadata: safeParse(record.metadata),
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
        updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
      };
    case 'study_units':
      return {
        ...base, 
        trackId: record.track_id,
        title: record.title,
        status: record.status,
        orderIndex: record.order_index || 0,
        durationMinutes: record.duration_minutes || null,
        actualTimeSpentMinutes: record.actual_time_spent_minutes || 0,
        priority: record.priority || null,
        difficultyRating: record.difficulty || null,
        metadata: safeParse(record.metadata),
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
        updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
      };
    case 'notes':
      return {
        ...baseWithUser,
        title: record.title || null,
        content: safeParse(record.content),
        category: record.category || "GENERAL",
        metadata: safeParse(record.metadata),
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
        updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
      };
    case 'unit_sessions':
      return {
        ...baseWithUser,
        unitId: record.unit_id,
        startedAt: record.started_at ? new Date(record.started_at) : new Date(),
        endedAt: record.ended_at ? new Date(record.ended_at) : null,
        watchedSeconds: record.watched_seconds || 0,
        isPaused: record.is_paused === 1 || record.is_paused === true,
        createdAt: record.created_at ? new Date(record.created_at) : new Date(),
      };
  }
  return null;
};

const mapToWatermelon = (tableName: string, record: any) => {
  switch (tableName) {
    case 'tasks':
      return {
        id: record.id,
        title: record.title,
        description: record.description || null,
        completed: record.completed,
        status: record.status,
        priority: record.priority || null,
        date: record.date ? record.date.getTime() : null,
        due_date: record.dueDate ? record.dueDate.getTime() : null,
        plan_id: record.planId || null,
        user_id: record.userId,
        estimated_minutes: record.estimatedMinutes || null,
        time_spent_minutes: record.timeSpentMinutes || 0,
        metadata: safeStringify(record.metadata),
        created_at: record.createdAt.getTime(),
        updated_at: record.updatedAt.getTime(),
      };
    case 'habits':
      return {
        id: record.id,
        title: record.title,
        icon: record.icon || null,
        color: record.color || null,
        active: record.active,
        order: record.order,
        user_id: record.userId,
        created_at: record.createdAt.getTime(),
        updated_at: record.updatedAt.getTime(),
      };
    case 'habit_logs':
      return {
        id: record.id,
        habit_id: record.habitId,
        user_id: record.userId,
        date: record.date.getTime(),
        completed: record.completed,
        created_at: record.createdAt.getTime(),
      };
    case 'study_tracks':
      return {
        id: record.id,
        title: record.title,
        type: record.type,
        status: record.status,
        progress_percentage: record.progressPercentage || 0,
        daily_allocation_minutes: record.dailyAllocationMinutes || null,
        estimated_completion_date: record.estimatedCompletionDate ? record.estimatedCompletionDate.getTime() : null,
        remaining_minutes: record.remainingMinutes || 0,
        metadata: safeStringify(record.metadata),
        user_id: record.userId,
        created_at: record.createdAt.getTime(),
        updated_at: record.updatedAt.getTime(),
      };
    case 'study_units':
      return {
        id: record.id,
        track_id: record.trackId,
        title: record.title,
        status: record.status,
        order_index: record.orderIndex || 0,
        duration_minutes: record.durationMinutes || null,
        actual_time_spent_minutes: record.actualTimeSpentMinutes || 0,
        priority: record.priority || null,
        difficulty: record.difficultyRating || null,
        metadata: safeStringify(record.metadata),
        created_at: record.createdAt.getTime(),
        updated_at: record.updatedAt.getTime(),
      };
    case 'notes':
      return {
        id: record.id,
        title: record.title || null,
        content: safeStringify(record.content),
        category: record.category || "GENERAL",
        metadata: safeStringify(record.metadata),
        user_id: record.userId,
        created_at: record.createdAt.getTime(),
        updated_at: record.updatedAt.getTime(),
      };
    case 'subtasks':
      return {
        id: record.id,
        task_id: record.taskId,
        title: record.title,
        completed: record.completed,
        created_at: record.createdAt.getTime(),
        updated_at: record.updatedAt.getTime(),
      };
    case 'unit_sessions':
      return {
        id: record.id,
        unit_id: record.unitId,
        user_id: record.userId,
        started_at: record.startedAt.getTime(),
        ended_at: record.endedAt ? record.endedAt.getTime() : null,
        watched_seconds: record.watchedSeconds,
        is_paused: record.isPaused,
        created_at: record.createdAt.getTime(),
      };
  }
  return null;
};

export async function pullChanges(userId: string, lastPulledAt: number | null) {
  const timestamp = Date.now();
  const dateObj = lastPulledAt ? new Date(lastPulledAt) : new Date(0);
  const changes: any = {};

  for (const [wmTable, prismaModel] of Object.entries(tableModelMap)) {
    const dateField = (wmTable === 'habit_logs' || wmTable === 'unit_sessions') ? 'createdAt' : 'updatedAt';
    
    let whereClause: any = { userId, [dateField]: { gt: dateObj } };
    if (wmTable === 'study_units') {
      whereClause = { track: { userId }, [dateField]: { gt: dateObj } };
    } else if (wmTable === 'subtasks') {
      whereClause = { task: { userId }, [dateField]: { gt: dateObj } };
    }
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const remoteRecords = await prisma[prismaModel].findMany({
      where: whereClause
    });

    const formattedRecords = remoteRecords.map((r: any) => mapToWatermelon(wmTable, r));
    
    let deletedIds: string[] = [];
    if (lastPulledAt) {
      const deletions = await prisma.mobileSyncDeletion.findMany({
        where: {
          userId,
          tableName: wmTable,
          deletedAt: { gt: dateObj }
        },
        select: { recordId: true }
      });
      deletedIds = deletions.map(d => d.recordId);
    }

    changes[wmTable] = {
      created: lastPulledAt ? [] : formattedRecords,
      updated: lastPulledAt ? formattedRecords : [],
      deleted: deletedIds
    };
  }

  return { changes, timestamp };
}

export async function pushChanges(userId: string, changes: any, lastPulledAt: number) {
  await prisma.$transaction(async (tx) => {
    for (const [wmTable, tableChanges] of Object.entries(changes) as any) {
      const prismaModel = (tableModelMap as any)[wmTable];
      if (!prismaModel) continue;

      const { created, updated, deleted } = tableChanges;

      // Created
      if (created && created.length > 0) {
        for (const record of created) {
          const data = mapToPrisma(wmTable, userId, record);
          if (!data) continue;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await tx[prismaModel].upsert({
            where: { id: data.id },
            create: data,
            update: data
          });
        }
      }

      // Updated
      if (updated && updated.length > 0) {
        for (const record of updated) {
          const data = mapToPrisma(wmTable, userId, record);
          if (!data) continue;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await tx[prismaModel].updateMany({
            where: { id: data.id },
            data
          });
        }
      }

      // Deleted
      if (deleted && deleted.length > 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await tx[prismaModel].deleteMany({
          where: { id: { in: deleted } }
        });
        
        for (const recordId of deleted) {
           await tx.mobileSyncDeletion.upsert({
             where: { userId_tableName_recordId: { userId, tableName: wmTable, recordId } },
             create: { userId, tableName: wmTable, recordId },
             update: { deletedAt: new Date() }
           });
        }
      }
    }
  });
}

export async function recordSyncDeletion(tx: any, userId: string, tableName: string, recordIds: string[]) {
  if (recordIds.length === 0) return;
  for (const recordId of recordIds) {
    await tx.mobileSyncDeletion.upsert({
      where: { userId_tableName_recordId: { userId, tableName, recordId } },
      create: { userId, tableName, recordId },
      update: { deletedAt: new Date() }
    });
  }
}
