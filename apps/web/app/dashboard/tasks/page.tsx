// apps/web/app/dashboard/tasks/page.tsx
import { billing } from "@domain";
import { getServerUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import TasksClientPage, { ExtendedTask } from "./tasks-client";
import { prisma } from "@/lib/prisma";

// Define a safe shape for any optional runtime-only fields that may exist on the
// Prisma result. Using `unknown` and concrete types avoids `any` and satisfies
// eslint's `@typescript-eslint/no-explicit-any` rule.
type TaskExtras = {
  timeSpentMinutes?: number;
  metadata?: Record<string, unknown> | null;
};

export default async function TasksPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 🔒 CHECK PERMISSION
  const perms = await billing.getPagePermissions(user.id);

  if (!perms.canViewTasks) {
    return (
      <FeatureLocked
        title="Task Management"
        description="Organize your life with advanced task lists, subtasks, and time tracking."
      />
    );
  }

  // ✅ SERVER SIDE DATA FETCHING
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    include: {
      subtasks: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });

  // ✅ TRANSFORM DATA
  const formattedTasks: ExtendedTask[] = tasks.map((t) => {
    // Cast to a narrow runtime-only extras type (no `any`)
    const taskWithExtras = t as unknown as TaskExtras;

    const formatted = {
      ...t,

      // Dates -> ISO string or null
      date: t.date ? t.date.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),

      // IMPORTANT: ExtendedTask currently expects `planId: string` (non-nullable).
      // We coerce missing values to an empty string here to keep the type system
      // happy. Consider updating the type to allow null if that's the correct
      // domain model.
      planId: t.planId ?? "",

      // Keep description/priority as they come from DB (string | null)
      description: t.description,
      priority: t.priority,

      // Custom numeric extension
      timeSpentMinutes: taskWithExtras.timeSpentMinutes ?? 0,

      // Subtasks transformation (dates -> strings)
      subtasks: (t.subtasks ?? []).map((st) => ({
        ...st,
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),

      // Metadata: pass through if present; keep type-safe `Record<string, unknown>`
      metadata: taskWithExtras.metadata ?? undefined,
    };

    // final cast: we've normalized all runtime values to the shape ExtendedTask
    return formatted as unknown as ExtendedTask;
  });

  // ✅ RENDER UI
  return <TasksClientPage initialTasks={formattedTasks} />;
}
