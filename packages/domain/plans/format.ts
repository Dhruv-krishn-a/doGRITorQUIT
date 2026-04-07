// packages/domain/plans/format.ts
export function formatPlanForClient(plan: any) {
  // shallow clone and convert dates to ISO strings
  return {
    ...plan,
    startDate: plan.startDate ? new Date(plan.startDate).toISOString() : null,
    endDate: plan.endDate ? new Date(plan.endDate).toISOString() : null,
    createdAt: plan.createdAt ? new Date(plan.createdAt).toISOString() : null,
    updatedAt: plan.updatedAt ? new Date(plan.updatedAt).toISOString() : null,
    tasks: (plan.tasks ?? []).map((t: any) => ({
      ...t,
      date: t.date ? new Date(t.date).toISOString() : null,
      subtasks: t.subtasks ?? [],
      tags: (t.tags ?? []).map((tt: any) => tt.tag ? tt.tag.name : tt),
    })),
  };
}
