// apps/web/app/dashboard/tasks/page.tsx (Server Component)
import { billing } from "@domain";
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FeatureLocked } from "@/shared/components/FeatureLocked";
import TasksClientPage from "./client"; // Import the UI you renamed

export default async function TasksPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 🔒 CHECK PERMISSION
  const perms = await billing.getPagePermissions(user.id);
  
  if (!perms.canViewTasks) {
    return <FeatureLocked title="Task Management" description="Organize your life with advanced task lists, subtasks, and time tracking." />;
  }

  // ✅ RENDER UI
  return <TasksClientPage />;
}