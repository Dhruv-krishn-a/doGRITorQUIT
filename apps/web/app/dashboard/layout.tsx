// apps/web/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth"; 
import { billing } from "@domain"; 
import Sidebar from "@shared/components/Sidebar";
import { UserSync } from "@features/auth"; 

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  // ✅ OPTIMIZATION: Fetch permissions in parallel with rendering preparation
  // Since we cached 'getUserEntitlements' in the domain logic, this is fast.
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