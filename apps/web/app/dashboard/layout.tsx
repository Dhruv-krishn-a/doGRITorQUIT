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
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* ✅ FIX 1: Sidebar comes FIRST to stay on the left */}
      <Sidebar permissions={permissions} />

      {/* Right Side Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* ✅ FIX 2: Header moves INSIDE this flex column */}
        <Header nav={siteNav} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
           
           <div className="w-full mx-auto p-4 md:p-8 lg:p-10 min-h-[calc(100vh-100px)]">
             {children}
           </div>

           <div className="mt-auto">
             <Footer nav={siteNav} />
           </div>

        </main>
      </div>
    </div>
  );
}