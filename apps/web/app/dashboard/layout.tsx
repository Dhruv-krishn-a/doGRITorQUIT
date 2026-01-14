import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { billing } from "@domain";
import Sidebar from "@shared/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch permissions
  const permissions = await billing.getPagePermissions(user.id);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* Sidebar (Fixed Left) */}
      <Sidebar permissions={permissions} />

      {/* Main Content Area (Flex Column) */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent p-4 md:p-8">
           {/* Width Constraint Container */}
           <div className="max-w-6xl mx-auto">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
}