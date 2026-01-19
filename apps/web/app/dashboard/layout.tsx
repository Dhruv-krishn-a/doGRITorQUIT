// apps/web/app/(app)/dashboard/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { billing } from "@domain";
import Sidebar from "@shared/components/Sidebar";
// REMOVE Header import
// import Header from "@shared/components/Header"; 
import Footer from "@shared/components/Footer"; 
import { siteNav } from "../../config/site";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch permissions
  const permissions = await billing.getPagePermissions(user.id);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* Sidebar acts as the 'Header' for the dashboard.
         It contains the Logo and Navigation.
      */}
      <Sidebar permissions={permissions} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* REMOVED <Header /> 
           This fixes the overlap. The Sidebar is now the only navigation.
        */}

        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
           
           {/* Removed 'pt-24' because we removed the fixed Header.
              Now content starts naturally at the top.
           */}
           <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-[calc(100vh-100px)]">
             {children}
           </div>

           {/* Footer stays at the bottom of the scroll area */}
           <div className="mt-auto">
             <Footer nav={siteNav} />
           </div>

        </main>
      </div>
    </div>
  );
}