// apps/web/shared/components/Sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNav } from "../../config/site";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  ListTodo,
  BarChart3,
  CreditCard,
  Settings,
  Brain,
  Sparkles
} from "lucide-react";

export interface SidebarPermissions {
  canViewDashboard: boolean;
  canViewPlans: boolean;
  canViewToday: boolean;
  canViewTasks: boolean;
  canViewChecklist: boolean;
  canViewStudy: boolean;
  canViewYouTube: boolean;
  canViewCourse: boolean;
  canViewProject: boolean;
  canViewAnalytics: boolean;
  canViewSubscription: boolean;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  "/dashboard": <LayoutDashboard size={20} />,
  "/dashboard/today": <CalendarDays size={20} />,
  "/dashboard/daily-checklist": <CheckSquare size={20} />,
  "/dashboard/study": <Brain size={20} />,
  "/dashboard/analytics": <BarChart3 size={20} />,
  "/dashboard/subscriptions": <CreditCard size={20} />,
  "/dashboard/settings": <Settings size={20} />,
};

const PATH_TO_PERM: Record<string, keyof SidebarPermissions> = {
  "/dashboard": "canViewDashboard",
  "/dashboard/today": "canViewToday",
  "/dashboard/daily-checklist": "canViewChecklist",
  "/dashboard/study": "canViewStudy",
  "/dashboard/analytics": "canViewAnalytics",
  "/dashboard/subscriptions": "canViewSubscription",
};

export default function Sidebar({ permissions }: { permissions?: SidebarPermissions }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  const dashboardNav = siteNav
    .filter((n) => n.group === "dashboard" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  useEffect(() => {
    setIsClient(true);
    try {
      const raw = localStorage.getItem("ui.sidebarCollapsed");
      if (raw !== null) setCollapsed(raw === "true");
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("ui.sidebarCollapsed", String(collapsed));
      } catch {
        // Ignore
      }
    }
  }, [collapsed, isClient]);

  // ✅ FIX: Wrapper variants that explicitly reserve space in the flex container
  const wrapperVariants = {
    expanded: { width: "19rem" },   // 17rem (sidebar) + 2rem (px-4 padding)
    collapsed: { width: "7.5rem" }, // 5.5rem (sidebar) + 2rem (px-4 padding)
  };

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    // ✅ FIX: This motion.div participates in the layout naturally. No more "fixed" overlap!
    <motion.div
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={wrapperVariants}
      transition={springConfig}
      className="transform-gpu h-screen py-4 px-4 hidden md:block shrink-0 z-1200"
    >
      <aside className="transform-gpu relative h-full w-full bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between rounded-[2.5rem] overflow-hidden transform-gpu antialiased">
        {/* Soft Background Tinting inside Sidebar */}
        <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-rose-100/50 to-pink-100/50 rounded-full blur-[60px] pointer-events-none -z-10 -mr-20 -mt-20 opacity-60" />
        <div className="transform-gpu absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-fuchsia-100/50 to-purple-100/50 rounded-full blur-[60px] pointer-events-none -z-10 -ml-20 -mb-20 opacity-60" />

        {/* --- Header / Logo --- */}
        <div className="transform-gpu flex items-center justify-between p-6 mb-2 relative z-10 shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="transform-gpu flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tighter uppercase"
              >
                <span>Planner</span>
                <Sparkles size={14} className="transform-gpu text-rose-500 animate-pulse drop-shadow-sm" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-xl text-slate-400 hover:text-rose-600 bg-white shadow-sm border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-all ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
          </motion.button>
        </div>

        {/* --- Navigation Items --- */}
        <nav className="transform-gpu flex-1 px-4 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pb-4 mt-2">
          {(() => {
            const plannerItems = dashboardNav.filter(i => ['dashboard', 'today', 'checklist', 'upgrade-os'].includes(i.id));
            const insightItems = dashboardNav.filter(i => ['analytics'].includes(i.id));
            const accountItems = dashboardNav.filter(i => ['subscription', 'subscriptions', 'settings'].includes(i.id));

            const renderGroup = (title: string, items: typeof dashboardNav) => {
              if (items.length === 0) return null;
              return (
                <div className="space-y-1">
                  {!collapsed && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                    >
                      {title}
                    </motion.div>
                  )}
                  {items.map((item) => {
                    const active = pathname === item.path;
                    const permKey = PATH_TO_PERM[item.path];
                    const isAllowed = permissions && permKey ? permissions[permKey] : true;
                    const Icon = ICONS_MAP[item.path] || <LayoutDashboard size={20} />;

                    if (!isAllowed) {
                      return <LockedItem key={item.id} icon={Icon} label={item.label} collapsed={collapsed} />;
                    }

                    return (
                      <Link key={item.id} href={item.path} className="transform-gpu block group relative outline-none">
                        <div
                          className={classNames(
                            "relative flex items-center px-4 py-3 rounded-[1.25rem] transition-colors duration-300",
                            active
                              ? "text-rose-600 font-bold"
                              : "text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50/50"
                          )}
                        >
                          {active && (
                            <motion.div
                              layoutId="activeSidebarIndicator"
                              className="transform-gpu absolute inset-0 bg-rose-50 border border-rose-100 rounded-[1.25rem] shadow-sm -z-10"
                              transition={springConfig}
                            />
                          )}

                          <div className="transform-gpu relative z-10 flex items-center gap-4 w-full">
                            <motion.span 
                              whileHover={{ scale: active ? 1 : 1.1, rotate: active ? 0 : 5 }}
                              className={classNames(
                                "transition-all duration-300", 
                                active ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "text-slate-400 group-hover:text-slate-600"
                              )}
                            >
                              {Icon}
                            </motion.span>
                            
                            <AnimatePresence mode="wait">
                              {!collapsed && (
                                <motion.span
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  className="transform-gpu text-sm tracking-wide whitespace-nowrap flex-1"
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {collapsed && (
                          <div className="transform-gpu absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-300">
                            {item.label}
                            <div className="transform-gpu absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 rotate-45" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            };

            return (
              <>
                {renderGroup("Planner", plannerItems)}
                {renderGroup("Insights", insightItems)}
                {renderGroup("Account", accountItems)}
              </>
            );
          })()}
        </nav>

        {/* --- Footer / User / Version --- */}
        <div className="transform-gpu p-6 mt-2 relative z-10 shrink-0">
           <div className={classNames(
             "flex items-center gap-4 p-2 rounded-3xl border border-transparent transition-all duration-300", 
             collapsed ? "justify-center" : "bg-white/50 border-white shadow-sm hover:shadow-md hover:bg-white"
           )}>
              <div className="transform-gpu relative shrink-0">
                <div className="transform-gpu w-10 h-10 rounded-full bg-linear-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_15px_rgba(244,63,94,0.4)] border-2 border-white">
                   N
                </div>
                <div className="transform-gpu absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" title="Online"></div>
              </div>
              
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="transform-gpu flex-1 min-w-0"
                  >
                    <p className="transform-gpu text-xs font-bold text-slate-900 tracking-tight truncate uppercase">Pro Plan Active</p>
                    <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">System v1.6.0</p>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </aside>
    </motion.div>
  );
}

function LockedItem({ icon, label, collapsed }: { icon: React.ReactNode, label: string, collapsed: boolean }) {
  return (
    <div className="transform-gpu group relative flex items-center px-4 py-3.5 rounded-[1.25rem] cursor-not-allowed transition-all duration-300 hover:bg-slate-50/50 border border-transparent hover:border-slate-100">
       <div className="transform-gpu relative z-10 text-slate-300 group-hover:text-slate-400 flex items-center gap-4 w-full">
         <span className="transform-gpu transition-transform duration-300 group-hover:scale-105">
           {icon}
         </span>
         
         <AnimatePresence mode="wait">
           {!collapsed && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="transform-gpu flex-1 flex items-center justify-between"
             >
               <span className="transform-gpu font-bold text-sm text-slate-400 tracking-wide">{label}</span>
               <Lock size={14} className="transform-gpu text-slate-300" />
             </motion.div>
           )}
         </AnimatePresence>
       </div>
       
       {collapsed && (
         <div className="transform-gpu absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-300">
            Locked
            <div className="transform-gpu absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 rotate-45" />
         </div>
       )}
    </div>
  );
}

function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}