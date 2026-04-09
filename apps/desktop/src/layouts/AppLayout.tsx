import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import TitleBar from "../components/layout/TitleBar";
import { useEntitlements } from "../features/billing/hooks/useEntitlements";
import { StudyFeatureProvider } from "../providers/StudyFeatureProvider";
import { OfflineGuard } from "../components/guards/OfflineGuard";
import { siteNav } from "../config/site";

export function AppLayout() {
  const { entitlements } = useEntitlements();

  return (
    <StudyFeatureProvider>
      <OfflineGuard>
        <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)]">
          <TitleBar />
          
          <div className="flex flex-1 text-[var(--text-primary)] overflow-hidden font-sans selection:bg-sky-500/30 selection:text-white">
            
            <Sidebar permissions={{
              canViewToday: true,
              canViewNotes: true,
              canViewChecklist: true,
              canViewStudy: entitlements?.features?.ACCESS_STUDY ?? false,
              canViewAnalytics: true,
              canViewSubscription: true,
              canViewSettings: true,
            }} />

            <div className="flex-1 flex flex-col min-w-0 relative w-full min-h-0">
              
              <Header nav={siteNav} />

              <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col overscroll-behavior-y-contain touch-action-pan-y">
                 
                 <div className="absolute top-0 left-1/2 w-[40vw] h-[40vw] max-w-150 max-h-150 bg-sky-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />

                 <div className="relative z-10 w-full mx-auto flex-1 flex flex-col min-h-full @container">
                   
                   <div className="flex-1">
                     <Outlet />
                   </div>

                   <div className="mt-auto relative z-10 py-6 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                     © {new Date().getFullYear()} DO GRIT OK QUIT
                   </div>

                   </div>
                   </main>
            </div>
          </div>
        </div>
      </OfflineGuard>
    </StudyFeatureProvider>
  );
}
