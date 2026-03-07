//apps/web/app/dashboard/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { billing } from "@domain";
import Sidebar from "@shared/components/Sidebar";
import Header from "@/shared/components/Header";
import Footer from "@shared/components/Footer"; 
import { siteNav } from "../../config/site";
import { StudyFeatureProvider } from "@/features/study/providers/StudyFeatureProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const permissions = await billing.getPagePermissions(user.id);

  return (
    <StudyFeatureProvider>
      <div className="flex h-screen bg-[#fdfbfb] text-slate-800 overflow-hidden font-sans selection:bg-rose-200 selection:text-rose-900">
        
        {/* The Sidebar (now automatically pushes content dynamically) */}
        <Sidebar permissions={permissions} />

        {/* ✅ FIX: Removed md:pl-[6.5rem]. The layout flexes naturally! */}
        <div className="flex-1 flex flex-col min-w-0 relative w-full transition-all duration-300">
          
          {/* Glass Header */}
          <Header nav={siteNav} />

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0 flex flex-col">
             
             {/* Global Ethereal Glow matching the new aesthetic */}
             <div className="absolute top-0 left-1/2 w-[60vw] h-[60vw] max-w-200 max-h-200 bg-rose-100/50 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />

             {/* Content Wrapper */}
             <div className="relative z-10 w-full mx-auto flex-1 flex flex-col min-h-[calc(100vh-80px)]">
               
               <div className="flex-1">
                 {children}
               </div>

               <div className="mt-auto relative z-10">
                 <Footer nav={siteNav} />
               </div>
               
             </div>
          </main>
        </div>
      </div>
    </StudyFeatureProvider>
  );
}