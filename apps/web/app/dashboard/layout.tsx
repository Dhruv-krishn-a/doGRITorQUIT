import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth"; // Ensure this uses cookies/headers
import { billing } from "@domain"; // Import the permission logic
import Sidebar from "@shared/components/Sidebar";
import { UserSync } from "@features/auth"; // Assuming this is a Client Component

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Server-Side Auth Check (Faster, Secure)
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Permissions for this user
  const permissions = await billing.getPagePermissions(user.id);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 3. Pass permissions to Client Sidebar */}
      <Sidebar permissions={permissions} />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* UserSync runs on client to ensure DB sync if needed */}
        <UserSync /> 
        {children}
      </main>
    </div>
  );
}