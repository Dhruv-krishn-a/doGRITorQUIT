//apps/web/app/dashboard/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { billing } from "@domain";
import Sidebar from "@shared/components/Sidebar";
import Header from "@/shared/components/Header";
import Footer from "@shared/components/Footer"; 
import { siteNav } from "../../config/site";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const permissions = await billing.getPagePermissions(user.id);

  return (
    // CHANGED: Base background is now an ultra-deep cherry/black. Added a custom selection color.
    <div className="flex h-screen bg-[#0a0105] text-rose-100 overflow-hidden font-sans selection:bg-rose-500/30 selection:text-white">
      {/* ✅ FIX 1: Sidebar comes FIRST to stay on the left */}
      <Sidebar permissions={permissions} />

      {/* Right Side Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* ✅ FIX 2: Header moves INSIDE this flex column */}
        <Header nav={siteNav} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-none relative">
           
           {/* ADDED: Subtle ambient background glow for the main canvas to match the cyberpunk aesthetic */}
           <div className="absolute top-0 left-1/2 w-200 h-150 bg-rose-600/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

           <div className="relative z-10 w-full mx-auto p-4 md:p-8 lg:p-10 min-h-[calc(100vh-100px)]">
             {children}
           </div>

           <div className="mt-auto relative z-10">
             <Footer nav={siteNav} />
           </div>

        </main>
      </div>
    </div>
  );
}