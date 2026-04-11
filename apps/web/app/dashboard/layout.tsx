//apps/web/app/dashboard/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { billing } from "@gritorquit/domain";
import Sidebar from "@shared/components/Sidebar";
import Header from "@/shared/components/Header";
import { siteNav } from "../../config/site";
import { StudyFeatureProvider } from "@/features/study/providers/StudyFeatureProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const permissions = {
    ...(await billing.getPagePermissions(user.id)),
    canViewSettings: true,
  };

  return (
    <StudyFeatureProvider>
      <div className="transform-gpu flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-[var(--accent-color)]/30 selection:text-[var(--text-primary)]">
        
        {/* The Sidebar */}
        <Sidebar permissions={permissions} />

        <div className="transform-gpu flex-1 flex flex-col min-w-0 relative w-full transition-all duration-300">
          
          {/* Header */}
          <Header nav={siteNav} />

          {/* Scrollable Main Content */}
          <main className="transform-gpu flex-1 overflow-y-auto custom-scrollbar relative z-0 flex flex-col">
             
             {/* Subtle Glow */}
             <div className="transform-gpu absolute top-0 left-1/2 w-[60vw] h-[60vw] max-w-200 max-h-200 bg-[var(--accent-color)]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />

             {/* Content Wrapper */}
             <div className="transform-gpu relative z-10 w-full mx-auto flex-1 flex flex-col min-h-[calc(100vh-80px)] @container">
               
               <div className="transform-gpu flex-1">
                 {children}
               </div>

               <div className="mt-auto relative z-10 py-6 text-center text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] opacity-60">
                 © {new Date().getFullYear()} grit.io
               </div>

               </div>
               </main>        </div>
      </div>
    </StudyFeatureProvider>
  );
}
