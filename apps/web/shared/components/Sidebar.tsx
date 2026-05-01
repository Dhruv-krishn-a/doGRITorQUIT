"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { siteNav } from "../../config/site";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Brain,
  BookOpen,
  Zap,
  RefreshCw,
  ListTodo,
  MessageSquare,
  Sparkles,
  Github,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
  "/dashboard/today": <Zap size={20} />,
  "/dashboard/notes": <BookOpen size={20} />,
  "/dashboard/study": <Brain size={20} />,
  "/dashboard/project-tracker": <Github size={18} />,
  "/dashboard/course-tracker": <BookOpen size={18} />,
  "/dashboard/media-tracker": <RefreshCw size={18} />,
  "/dashboard/roadmap-tracker": <Sparkles size={18} />,
  "/dashboard/daily-checklist": <ListTodo size={20} />,
  "/dashboard/analytics": <BarChart3 size={20} />,
  "/dashboard/subscriptions": <CreditCard size={20} />,
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
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

    // Fetch Session and Profile
    const fetchUser = async () => {
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        if (session?.user) {
          setUserEmail(session.user.email ?? null);
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const profile = await res.json();
            setUserName(profile.name || session.user.name || null);
          } else {
            setUserName(session.user.name || null);
          }
        }
      } catch (err) {
        console.error("Sidebar user fetch error:", err);
      }
    };
    
    fetchUser();

    const raw = localStorage.getItem("ui.sidebarCollapsed");
    if (raw !== null) setCollapsed(raw === "true");
  }, [pathname]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("ui.sidebarCollapsed", String(collapsed));
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
      className="h-screen sticky top-0 py-4 px-4 hidden md:block shrink-0 z-1200 overflow-hidden"
    >
      <aside className="relative h-full w-full bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col justify-between rounded-[2.5rem] overflow-hidden transition-colors duration-500">

        {/* Header */}
        <div className="flex items-center justify-between p-6">
          {!collapsed && <GritioLogo size="sm" withText />}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-all active:scale-95"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4 custom-scrollbar">
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
                        href={item.path}
                        className={cn(
                            "flex items-center px-4 py-3 rounded-xl transition-all",
                            active ? "font-bold text-[var(--text-primary)] bg-[var(--bg-secondary)]/50" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/30"
                        )}
                        onClick={() => {
                            if (hasSubItems && !isExpanded) {
                                setExpandedItems(prev => ({ ...prev, [item.id]: true }));
                            }
                        }}
                    >
                        <span className={cn(active && "text-[var(--accent-color)]")}>{Icon}</span>

                        {!collapsed && (
                            <>
                                <span className="ml-4 text-sm uppercase font-black tracking-widest flex-1">
                                    {item.label}
                                </span>
                                {hasSubItems && (
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleItemExpansion(item.id, e);
                                        }}
                                        className="p-1 hover:bg-[var(--accent-color)]/10 rounded-md transition-all z-20"
                                    >
                                        <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded ? "" : "-rotate-90")} />
                                    </button>
                                )}
                            </>
                        )}
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
                                    <Link key={sub.id} href={sub.path} className="block group">
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
              </div>
            );
          })}

          {/* Feedback */}
          <Link href="/dashboard/feedback" className="block group pt-2">
            <div className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all",
                pathname === '/dashboard/feedback' ? "font-bold text-[var(--text-primary)] bg-[var(--bg-secondary)]/50" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/30"
            )}>
              <MessageSquare size={20} className={cn(pathname === '/dashboard/feedback' && "text-[var(--accent-color)]")} />
              {!collapsed && <span className="ml-4 text-sm uppercase font-black tracking-widest">Feedback</span>}
            </div>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-color)]/30">
          <ProfileExpansion userName={userName} userEmail={userEmail} collapsed={collapsed} />

          <div className="mt-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)] shadow-inner">
              <RefreshCw size={16} className="text-[var(--text-secondary)]" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] leading-none">Smart Sync</p>
                <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1.5 opacity-60">Operational</p>
              </div>
            )}
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

function LockedItem({ icon, label, collapsed }: { icon: React.ReactNode, label: string, collapsed: boolean }) {
  return (
    <div className="flex items-center px-4 py-3 opacity-30 cursor-not-allowed">
      {icon}
      {!collapsed && <span className="ml-4 text-sm uppercase font-black tracking-widest">{label}</span>}
      {!collapsed && <Lock size={14} className="ml-auto" />}
    </div>
  );
}
