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
  BarChart3,
  CreditCard,
  Settings,
  Brain,
  Sparkles,
  BookOpen,
  Zap,
  RefreshCw,
  ListTodo
} from "lucide-react";

export interface SidebarPermissions {
  canViewToday: boolean;
  canViewNotes: boolean;
  canViewChecklist: boolean;
  canViewStudy: boolean;
  canViewAnalytics: boolean;
  canViewSubscription: boolean;
  canViewSettings: boolean;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  "/dashboard/today": <Zap size={20} />,
  "/dashboard/notes": <BookOpen size={20} />,
  "/dashboard/study": <Brain size={20} />,
  "/dashboard/daily-checklist": <ListTodo size={20} />,
  "/dashboard/analytics": <BarChart3 size={20} />,
  "/dashboard/subscriptions": <CreditCard size={20} />,
  "/dashboard/settings": <Settings size={20} />,
};

const PATH_TO_PERM: Record<string, keyof SidebarPermissions> = {
  "/dashboard/today": "canViewToday",
  "/dashboard/notes": "canViewNotes",
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
      className="transform-gpu h-screen py-4 px-4 hidden md:block shrink-0 z-1200"
    >
      <aside className="transform-gpu relative h-full w-full bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col justify-between rounded-[2.5rem] overflow-hidden transform-gpu antialiased">
        {/* --- Header / Logo --- */}
        <div className="transform-gpu flex items-center justify-between p-6 mb-2 relative z-10 shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="transform-gpu flex items-center gap-2 font-black text-xl text-[var(--text-primary)] tracking-tighter uppercase italic"
              >
                <span>DO GRIT</span>
                <Sparkles size={14} className="transform-gpu text-[var(--accent-color)] animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
          </motion.button>
        </div>

        {/* --- Navigation Items --- */}
        <nav className="transform-gpu flex-1 px-4 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pb-4 mt-2">
          {dashboardNav.map((item) => {
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
                      ? "text-[var(--text-primary)] font-bold"
                      : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="transform-gpu absolute inset-0 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 rounded-[1.25rem] -z-10"
                      transition={springConfig}
                    />
                  )}

                  <div className="transform-gpu relative z-10 flex items-center gap-4 w-full">
                    <motion.span 
                      whileHover={{ scale: active ? 1 : 1.1 }}
                      className={classNames(
                        "transition-all duration-300", 
                        active ? "text-[var(--accent-color)] drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
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
                          className="transform-gpu text-sm tracking-wide whitespace-nowrap flex-1 uppercase font-black"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {collapsed && (
                  <div className="transform-gpu absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-300">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* --- Footer / User / Version --- */}
        <div className="transform-gpu p-6 mt-2 relative z-10 shrink-0">
           <div className={classNames(
             "flex items-center gap-4 p-2 rounded-3xl border border-transparent transition-all duration-300", 
             collapsed ? "justify-center" : "bg-[var(--bg-secondary)]/50 border-[var(--border-color)] shadow-sm"
           )}>
              <div className="transform-gpu relative shrink-0">
                <div className="transform-gpu w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm border border-[var(--border-color)]">
                   <RefreshCw size={16} className="text-[var(--text-secondary)]" />
                </div>
                <div className="transform-gpu absolute bottom-0 right-0 w-3 h-3 bg-mint rounded-full border-2 border-[var(--bg-card)] shadow-sm" title="Online"></div>
              </div>
              
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="transform-gpu flex-1 min-w-0"
                  >
                    <p className="transform-gpu text-[10px] font-black text-[var(--text-primary)] tracking-widest uppercase">Neural Sync</p>
                    <p className="transform-gpu text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 truncate">System Operational</p>
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
    <div className="transform-gpu group relative flex items-center px-4 py-3.5 rounded-[1.25rem] cursor-not-allowed transition-all duration-300 hover:bg-[var(--bg-secondary)]/30">
       <div className="transform-gpu relative z-10 text-[var(--text-secondary)] flex items-center gap-4 w-full">
         <span className="transform-gpu transition-transform duration-300 group-hover:scale-105">
           {icon}
         </span>
         
         <AnimatePresence mode="wait">
           {!collapsed && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="transform-gpu flex-1 flex items-center justify-between"
             >
               <span className="transform-gpu font-bold text-sm text-[var(--text-secondary)] tracking-wide uppercase">{label}</span>
               <Lock size={14} className="transform-gpu text-[var(--text-secondary)]/50" />
             </motion.div>
           )}
         </AnimatePresence>
       </div>
    </div>
  );
}

function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
