import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { siteNav } from "../../config/site";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useSyncStatus } from "../../hooks/useSyncStatus";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { api } from "../../services/api";

import {
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  ListTodo,
  BarChart3,
  CreditCard,
  Settings,
  Brain,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  RefreshCw,
  LayoutDashboard,
  MessageSquare,
  User,
  Github
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
  "/project-tracker": <Github size={18} />,
  "/course-tracker": <BookOpen size={18} />,
  "/media-tracker": <RefreshCw size={18} />,
  "/roadmap-tracker": <Sparkles size={18} />,
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
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const dashboardNav = siteNav
    .filter((n) => n.group === "dashboard" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  useEffect(() => {
    setIsClient(true);
    
    // Auto-expand parents of active paths
    const initialExpanded: Record<string, boolean> = {};
    siteNav.forEach(item => {
        if (item.subItems?.some(sub => pathname === sub.path || pathname.startsWith(sub.path))) {
            initialExpanded[item.id] = true;
        }
    });
    setExpandedItems(prev => ({ ...prev, ...initialExpanded }));

    // Fetch Profile for name
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const data = await api.get("/api/auth/me");
        if (data?.name) {
          setUserName(data.name);
        } else {
          setUserName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User');
        }
      } catch (err) {
        setUserName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User');
      }
    };
    
    fetchProfile();

    try {
      const raw = localStorage.getItem("ui.sidebarCollapsed");
      if (raw !== null) setCollapsed(raw === "true");
    } catch {
      // Ignore
    }
  }, [user, pathname]);

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

  const toggleItemExpansion = (id: string, e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (collapsed) {
        setCollapsed(false);
        setExpandedItems(prev => ({ ...prev, [id]: true }));
    } else {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  return (
    <motion.div
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={wrapperVariants}
      transition={springConfig}
      className="h-full py-4 px-4 hidden md:block shrink-0 z-[10000]"
    >
      <aside className="relative h-full w-full bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col justify-between rounded-[2.5rem] overflow-hidden antialiased transition-colors duration-500">
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

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pb-4 mt-2">
          {dashboardNav.map((item) => {
            const active = pathname === item.path || item.subItems?.some(sub => pathname === sub.path);
            const permKey = PATH_TO_PERM[item.path];
            const isAllowed = permissions && permKey ? permissions[permKey] : true;
            const Icon = ICONS_MAP[item.path] || <LayoutDashboard size={20} />;
            const isExpanded = expandedItems[item.id];
            const hasSubItems = item.subItems && item.subItems.length > 0;

            if (!isAllowed) {
              return <LockedItem key={item.id} icon={Icon} label={item.label} collapsed={collapsed} />;
            }

            return (
              <div key={item.id} className="space-y-1">
                <div className="group relative">
                    <Link 
                        to={item.path}
                        className={cn(
                            "relative flex items-center px-4 py-3 rounded-[1.25rem] transition-colors duration-300",
                            active
                            ? "text-[var(--text-primary)] font-bold bg-[var(--bg-secondary)]/50"
                            : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/30"
                        )}
                        onClick={(e) => {
                            if (hasSubItems && !isExpanded) {
                                setExpandedItems(prev => ({ ...prev, [item.id]: true }));
                            }
                        }}
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
                                "transition-all duration-300 shrink-0", 
                                active ? "text-[var(--accent-color)] drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                            )}
                            >
                            {Icon}
                            </motion.span>
                            
                            <AnimatePresence mode="wait">
                            {!collapsed && (
                                <>
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-sm tracking-widest whitespace-nowrap flex-1 uppercase font-black"
                                    >
                                        {item.label}
                                    </motion.span>
                                    {hasSubItems && (
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleItemExpansion(item.id, e);
                                            }}
                                            className="p-1 hover:bg-[var(--accent-color)]/10 rounded-md transition-all z-20"
                                        >
                                            <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded ? "" : "-rotate-90")} />
                                        </button>
                                    )}
                                </>
                            )}
                            </AnimatePresence>
                        </div>
                    </Link>
                </div>

                {/* Sub Items */}
                <AnimatePresence>
                    {hasSubItems && isExpanded && !collapsed && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden pl-10 space-y-1"
                        >
                            {item.subItems!.map(sub => {
                                const subActive = pathname === sub.path;
                                const SubIcon = ICONS_MAP[sub.path] || <ChevronRight size={14} />;
                                return (
                                    <Link key={sub.id} to={sub.path} className="block group">
                                        <div className={`flex items-center px-4 py-2.5 rounded-xl transition-all ${
                                            subActive ? "font-bold text-[var(--accent-color)] bg-[var(--bg-secondary)]/30" : "text-[var(--text-secondary)]/60 hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/20"
                                        }`}>
                                            <span className="shrink-0">{SubIcon}</span>
                                            <span className="ml-3 text-[11px] uppercase font-bold tracking-wider">
                                                {sub.label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-300">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[var(--border-color)]/30">
            <Link to="/feedback" className="block group relative outline-none">
              <div
                className={cn(
                  "relative flex items-center px-4 py-3 rounded-[1.25rem] transition-colors duration-300",
                  pathname === "/feedback"
                    ? "text-[var(--text-primary)] font-bold bg-[var(--bg-secondary)]/50"
                    : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/30"
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
                        className="text-sm tracking-widest whitespace-nowrap flex-1 uppercase font-black"
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

        <div className="p-6 mt-2 relative z-10 shrink-0 border-t border-[var(--border-color)]/30">
           <ProfileExpansion userName={userName} userEmail={user?.email || null} collapsed={collapsed} />
           
           <div className={cn(
             "mt-6 flex items-center gap-4 p-2 rounded-3xl border border-transparent transition-all duration-300", 
             collapsed ? "justify-center" : "bg-[var(--bg-secondary)]/50 border-[var(--border-color)] shadow-inner"
           )}>
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm border border-[var(--border-color)] shadow-inner">
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
                    <p className="text-[10px] font-black text-[var(--text-primary)] tracking-widest uppercase leading-none">
                      Smart Sync
                    </p>
                    <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1.5 truncate opacity-60">
                      Operational
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

function ProfileExpansion({ userName, userEmail, collapsed }: { userName: string | null; userEmail: string | null; collapsed: boolean }) {
  const initial = (userName?.[0] || userEmail?.[0] || "U").toUpperCase();
  const display = userName || userEmail?.split('@')[0] || "User";

  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)]/10 border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-color)] text-xs font-black shadow-inner shrink-0 group-hover:scale-105 transition-transform">
        {initial}
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight truncate leading-none">{display}</p>
          <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1.5 opacity-40 truncate">System Hub</p>
        </div>
      )}
    </div>
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
       <div className="relative z-10 text-[var(--text-secondary)] flex items-center gap-4 w-full opacity-30">
         <span className="transition-transform duration-300 group-hover:scale-105">
           {icon}
         </span>
         
         <AnimatePresence mode="wait">
           {!collapsed && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex-1 flex items-center justify-between"
             >
               <span className="font-bold text-sm text-[var(--text-secondary)] tracking-widest uppercase">{label}</span>
               <Lock size={14} className="text-[var(--text-secondary)]/50" />
             </motion.div>
           )}
         </AnimatePresence>
       </div>
    </div>
  );
}
