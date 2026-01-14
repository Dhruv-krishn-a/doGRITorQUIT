// apps/web/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth"; 
import { billing } from "@domain"; 
import Sidebar from "@shared/components/Sidebar";
import { UserSync } from "@features/auth"; 

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Fast Auth Check
  const user = await getServerUser();
  if (!user) redirect("/login");

  // 2. Fetch Permissions (This is now fast because of the index we added earlier)
  const permissions = await billing.getPagePermissions(user.id);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar permissions={permissions} />
      <main className="flex-1 p-6 overflow-auto">
        <UserSync /> 
        {children}
      </main>
    </div>
  );
}