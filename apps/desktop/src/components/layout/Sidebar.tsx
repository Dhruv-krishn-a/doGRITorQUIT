import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { siteNav } from "../../config/site";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEntitlements } from "../../features/billing/hooks/useEntitlements";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  Sparkles,
  Zap
} from "lucide-react";

export interface SidebarPermissions {
  canViewDashboard: boolean;
  canViewToday: boolean;
  canViewChecklist: boolean;
  canViewStudy: boolean;
  canViewYouTube: boolean;
  canViewCourse: boolean;
  canViewProject: boolean;
  canViewAnalytics: boolean;
  canViewSubscription: boolean;
  canViewSettings: boolean;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  "/": <LayoutDashboard size={20} />,
  "/today": <Zap size={20} />,
  "/daily-checklist": <ListTodo size={20} />,
  "/study": <Brain size={20} />,
  "/analytics": <BarChart3 size={20} />,
  "/subscriptions": <CreditCard size={20} />,
  "/settings": <Settings size={20} />,
};

const PATH_TO_PERM: Record<string, keyof SidebarPermissions> = {
  "/": "canViewDashboard",
  "/today": "canViewToday",
  "/daily-checklist": "canViewChecklist",
  "/study": "canViewStudy",
  "/analytics": "canViewAnalytics",
  "/subscriptions": "canViewSubscription",
  "/settings": "canViewSettings",
};

export default function Sidebar({ permissions }: { permissions?: SidebarPermissions }) {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const { entitlements } = useEntitlements();

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

  const wrapperVariants = {
    expanded: { width: "19rem" },
    collapsed: { width: "7.5rem" },
  };

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <motion.div
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={wrapperVariants}
      transition={springConfig}
      className="transform-gpu h-screen py-4 px-4 hidden md:block shrink-0 z-[1200]"
    >
      <aside className="transform-gpu relative h-full w-full bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between rounded-[2.5rem] overflow-hidden transform-gpu antialiased">
        <div className="transform-gpu absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-100/50 to-pink-100/50 rounded-full blur-[60px] pointer-events-none -z-10 -mr-20 -mt-20 opacity-60" />
        <div className="transform-gpu absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-fuchsia-100/50 to-purple-100/50 rounded-full blur-[60px] pointer-events-none -z-10 -ml-20 -mb-20 opacity-60" />

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
            className={cn(
              "p-2 rounded-xl text-slate-400 hover:text-rose-600 bg-white shadow-sm border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-all",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
          </motion.button>
        </div>

        <nav className="transform-gpu flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pb-4">
          {dashboardNav.map((item) => {
            const active = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
            const permKey = PATH_TO_PERM[item.path];
            const isAllowed = permissions && permKey ? permissions[permKey] : true;
            const Icon = ICONS_MAP[item.path] || <LayoutDashboard size={20} />;

            if (!isAllowed) {
              return (
                <LockedItem 
                  key={item.id} 
                  icon={Icon} 
                  label={item.label} 
                  collapsed={collapsed} 
                />
              );
            }

            return (
              <Link key={item.id} to={item.path} className="transform-gpu block group relative outline-none">
                <div
                  className={cn(
                    "relative flex items-center px-4 py-3.5 rounded-[1.25rem] transition-colors duration-300",
                    active
                      ? "text-rose-600 font-bold"
                      : "text-slate-500 font-bold hover:text-slate-900"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="transform-gpu absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-[1.25rem] shadow-sm -z-10"
                      transition={springConfig}
                    />
                  )}

                  <div className="transform-gpu relative z-10 flex items-center gap-4 w-full">
                    <motion.span 
                      whileHover={{ scale: active ? 1 : 1.1, rotate: active ? 0 : 5 }}
                      className={cn(
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
        </nav>

        <div className="transform-gpu p-6 mt-2 relative z-10 shrink-0">
           <div className={cn(
             "flex items-center gap-4 p-2 rounded-3xl border border-transparent transition-all duration-300", 
             collapsed ? "justify-center" : "bg-white/50 border-white shadow-sm hover:shadow-md hover:bg-white"
           )}>
              <div className="transform-gpu relative shrink-0">
                <div className="transform-gpu w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_15px_rgba(244,63,94,0.4)] border-2 border-white">
                   {entitlements?.tier?.charAt(0) || 'F'}
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
                    <p className="transform-gpu text-xs font-bold text-slate-900 tracking-tight truncate uppercase">
                      {entitlements?.tier || 'Free'} Plan Active
                    </p>
                    <p className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                      System v1.6.0
                    </p>
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
         <div className="transform-gpu absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[50] shadow-xl transition-opacity duration-300">
            Locked
            <div className="transform-gpu absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 rotate-45" />
         </div>
       )}
    </div>
  );
}
