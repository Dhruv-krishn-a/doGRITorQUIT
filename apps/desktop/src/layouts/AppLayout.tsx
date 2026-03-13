import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { siteNav } from "../config/site";
import { useEntitlements } from "../features/billing/hooks/useEntitlements";
import { StudyFeatureProvider } from "../providers/StudyFeatureProvider";
import { OfflineGuard } from "../components/guards/OfflineGuard";

export function AppLayout() {
  const { entitlements } = useEntitlements();

  return (
    <StudyFeatureProvider>
      <OfflineGuard>
        <div className="transform-gpu flex h-screen bg-[#fdfbfb] text-slate-800 overflow-hidden font-sans selection:bg-rose-200 selection:text-rose-900">
          
          <Sidebar permissions={{
            canViewDashboard: true,
            canViewToday: true,
            canViewChecklist: true,
            canViewStudy: entitlements?.features?.ACCESS_STUDY ?? false,
            canViewYouTube: true,
            canViewCourse: true,
            canViewProject: true,
            canViewAnalytics: true,
            canViewSubscription: true,
            canViewSettings: true,
          }} />

          <div className="transform-gpu flex-1 flex flex-col min-w-0 relative w-full transition-all duration-300">
            
            <Header nav={siteNav} />

            <main className="transform-gpu flex-1 overflow-y-auto custom-scrollbar relative z-0 flex flex-col">
               
               <div className="transform-gpu absolute top-0 left-1/2 w-[60vw] h-[60vw] max-w-200 max-h-200 bg-rose-100/50 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />

               <div className="transform-gpu relative z-10 w-full mx-auto flex-1 flex flex-col min-h-[calc(100vh-80px)] @container">
                 
                 <div className="transform-gpu flex-1">
                   <Outlet />
                 </div>

                 <div className="mt-auto relative z-10 py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
                   © {new Date().getFullYear()} Do Grit
                 </div>

                 </div>
                 </main>          </div>
        </div>
      </OfflineGuard>
    </StudyFeatureProvider>
  );
}
