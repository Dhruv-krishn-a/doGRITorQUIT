import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { siteNav } from "../../config/site";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useSyncStatus } from "../../hooks/useSyncStatus";

import {
  Lock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ListTodo,
  BarChart3,
  CreditCard,
  Settings,
  Brain,
  Sparkles,
  Zap,
  BookOpen,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";

import { GritioLogo } from '@gritorquit/dashboard-ui-web';

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
  "/today": <Zap size={20} />,
  "/notes": <BookOpen size={20} />,
  "/study": <Brain size={20} />,
  "/daily-checklist": <ListTodo size={20} />,
  "/analytics": <BarChart3 size={20} />,
  "/subscriptions": <CreditCard size={20} />,
  "/settings": <Settings size={20} />,
};

const PATH_TO_PERM: Record<string, keyof SidebarPermissions> = {
  "/today": "canViewToday",
  "/notes": "canViewNotes",
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
      className="h-full py-4 px-4 hidden md:block shrink-0 z-[1200]"
    >
      <aside className="relative h-full w-full bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col justify-between rounded-[2.5rem] overflow-hidden antialiased">
        <div className="flex items-center justify-between p-6 mb-2 relative z-10 shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="transform-gpu flex items-center"
              >
                <GritioLogo size="sm" withText={true} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
          </motion.button>
        </div>

        <nav className="flex-1 px-4 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pb-4 mt-2">
          {dashboardNav.map((item) => {
            const active = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
            const permKey = PATH_TO_PERM[item.path];
            const isAllowed = permissions && permKey ? permissions[permKey] : true;
            const Icon = ICONS_MAP[item.path] || <LayoutDashboard size={20} />;

            if (!isAllowed) {
              return <LockedItem key={item.id} icon={Icon} label={item.label} collapsed={collapsed} />;
            }

            return (
              <Link key={item.id} to={item.path} className="block group relative outline-none">
                <div
                  className={cn(
                    "relative flex items-center px-4 py-3 rounded-[1.25rem] transition-colors duration-300",
                    active
                      ? "text-[var(--text-primary)] font-bold"
                      : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute inset-0 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 rounded-[1.25rem] -z-10"
                      transition={springConfig}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <motion.span 
                      whileHover={{ scale: active ? 1 : 1.1 }}
                      className={cn(
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
                          className="text-sm tracking-wide whitespace-nowrap flex-1 uppercase font-black"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-300">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[var(--border-color)]/50">
            <Link to="/feedback" className="block group relative outline-none">
              <div
                className={cn(
                  "relative flex items-center px-4 py-3 rounded-[1.25rem] transition-colors duration-300",
                  pathname === "/feedback"
                    ? "text-[var(--text-primary)] font-bold"
                    : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50"
                )}
              >
                {pathname === "/feedback" && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 rounded-[1.25rem] -z-10"
                    transition={springConfig}
                  />
                )}

                <div className="relative z-10 flex items-center gap-4 w-full">
                  <motion.span 
                    whileHover={{ scale: pathname === "/feedback" ? 1 : 1.1 }}
                    className={cn(
                      "transition-all duration-300", 
                      pathname === "/feedback" ? "text-[var(--accent-color)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                    )}
                  >
                    <MessageSquare size={20} />
                  </motion.span>
                  
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm tracking-wide whitespace-nowrap flex-1 uppercase font-black"
                      >
                        Feedback
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Link>
          </div>
        </nav>

        <div className="p-6 mt-2 relative z-10 shrink-0">
           <div className={cn(
             "flex items-center gap-4 p-2 rounded-3xl border border-transparent transition-all duration-300", 
             collapsed ? "justify-center" : "bg-[var(--bg-secondary)]/50 border-[var(--border-color)] shadow-sm"
           )}>
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm border border-[var(--border-color)]">
                   <RefreshCw size={16} className="text-[var(--text-secondary)]" />
                </div>
                <SyncIndicator />
              </div>
              
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-[10px] font-black text-[var(--text-primary)] tracking-widest uppercase">
                      Smart Sync
                    </p>
                    <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 truncate">
                      System Operational
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

function SyncIndicator() {
  const { queueCount, isSyncing, triggerSync } = useSyncStatus();
  if (!isSyncing) return <div className="absolute bottom-0 right-0 w-3 h-3 bg-mint rounded-full border-2 border-[var(--bg-card)] shadow-sm"></div>;

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); triggerSync(); }}
      className="absolute -bottom-1 -right-1 flex items-center justify-center bg-amber text-obsidian rounded-full border-2 border-[var(--bg-card)] shadow-sm px-1.5 py-0.5 hover:bg-[var(--accent-color)] transition-colors cursor-pointer group/sync" 
    >
       <RefreshCw size={8} className="animate-spin" />
       <span className="text-[7px] font-black ml-0.5">{queueCount}</span>
    </button>
  );
}

function LockedItem({ icon, label, collapsed }: { icon: React.ReactNode, label: string, collapsed: boolean }) {
  return (
    <div className="group relative flex items-center px-4 py-3.5 rounded-[1.25rem] cursor-not-allowed transition-all duration-300 hover:bg-[var(--bg-secondary)]/30">
       <div className="relative z-10 text-[var(--text-secondary)] flex items-center gap-4 w-full">
         <span className="transition-transform duration-300 group-hover:scale-105">
           {icon}
         </span>
         
         <AnimatePresence mode="wait">
           {!collapsed && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex-1 flex items-center justify-between"
             >
               <span className="font-bold text-sm text-[var(--text-secondary)] tracking-wide uppercase">{label}</span>
               <Lock size={14} className="text-[var(--text-secondary)]/50" />
             </motion.div>
           )}
         </AnimatePresence>
       </div>
    </div>
  );
}
