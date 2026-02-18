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
  Brain
} from "lucide-react";

// --- Types ---
export interface SidebarPermissions {
  canViewDashboard: boolean;
  canViewPlans: boolean;
  canViewTasks: boolean;
  canViewChecklist: boolean;
  canViewStudy: boolean;
  canViewAnalytics: boolean;
  canViewSubscription: boolean;
}

// --- Icons Mapping ---
const ICONS_MAP: Record<string, React.ReactNode> = {
  "/dashboard": <LayoutDashboard size={20} />,
  "/dashboard/plans": <CalendarDays size={20} />,
  "/dashboard/tasks": <ListTodo size={20} />,
  "/dashboard/checklist": <CheckSquare size={20} />,
  "/dashboard/study": <Brain size={20} />,
  "/dashboard/analytics": <BarChart3 size={20} />,
  "/dashboard/subscriptions": <CreditCard size={20} />,
  "/dashboard/settings": <Settings size={20} />,
};

const PATH_TO_PERM: Record<string, keyof SidebarPermissions> = {
  "/dashboard": "canViewDashboard",
  "/dashboard/plans": "canViewPlans",
  "/dashboard/tasks": "canViewTasks",
  "/dashboard/checklist": "canViewChecklist",
  "/dashboard/study": "canViewStudy",
  "/dashboard/analytics": "canViewAnalytics",
  "/dashboard/subscriptions": "canViewSubscription",
};

export default function Sidebar({ permissions }: { permissions?: SidebarPermissions }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  // ✅ FIX: Reverted to "dashboard" because the error confirms it IS a valid type in this file.
  const dashboardNav = siteNav
    .filter((n) => n.group === "dashboard" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Handle Hydration & Local Storage
  useEffect(() => {
    setIsClient(true);
    try {
      const raw = localStorage.getItem("ui.sidebarCollapsed");
      if (raw !== null) setCollapsed(raw === "true");
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("ui.sidebarCollapsed", String(collapsed));
      } catch {
        // Ignore localStorage write errors
      }
    }
  }, [collapsed, isClient]);

  // Sidebar Variants for Animation
  const sidebarVariants = {
    expanded: { width: "16rem" }, // w-64
    collapsed: { width: "5rem" }, // w-20
  };

  return (
    <motion.aside
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative h-screen bg-slate-50/50 backdrop-blur-xl border-r border-slate-200/60 z-60 flex flex-col justify-between"
    >
      {/* --- Header / Logo --- */}
      <div className="flex items-center justify-between p-5 mb-2">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 font-bold text-xl text-slate-800 tracking-tight"
            >
              <span className="bg-linear-to-br from-indigo-500 to-purple-600 text-transparent bg-clip-text">
                Planner
              </span>
              <span className="text-slate-400 text-xs font-normal border border-slate-200 px-1.5 py-0.5 rounded-full">
                Beta
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* --- Navigation Items --- */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-none">
        {dashboardNav.map((item) => {
          const active = pathname === item.path;
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
            <Link key={item.id} href={item.path} className="block group relative">
              <div
                className={classNames(
                  "relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300",
                  active
                    ? "text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                )}
              >
                {/* Active Gradient Background */}
                {active && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Content Layer (Above Background) */}
                <div className="relative z-10 flex items-center gap-3">
                  <span className={classNames("transition-colors", active ? "text-white" : "group-hover:text-indigo-500")}>
                    {Icon}
                  </span>
                  
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* --- Footer / User / Version --- */}
      <div className="p-4 border-t border-slate-100">
         <div className={classNames("flex items-center gap-3", collapsed ? "justify-center" : "")}>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-200 to-orange-400 flex items-center justify-center text-amber-900 font-bold text-xs shadow-inner">
               P
            </div>
            {!collapsed && (
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">Pro Plan</p>
                  <p className="text-[10px] text-slate-400">v1.0.0</p>
               </div>
            )}
         </div>
      </div>
    </motion.aside>
  );
}

// --- Subcomponents ---

function LockedItem({ icon, label, collapsed }: { icon: React.ReactNode, label: string, collapsed: boolean }) {
  return (
    <div className="group relative flex items-center gap-3 px-3 py-3 rounded-2xl mx-1 my-1 cursor-not-allowed opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
       <div className="absolute inset-0 bg-linear-to-r from-slate-100 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
       
       <div className="relative z-10 text-slate-400 group-hover:text-slate-600 flex items-center gap-3 w-full">
         {icon}
         {!collapsed && (
           <div className="flex-1 flex items-center justify-between">
             <span className="font-medium text-sm">{label}</span>
             <Lock size={14} className="text-amber-500/80" />
           </div>
         )}
       </div>
       
       {collapsed && (
         <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            Locked
         </div>
       )}
    </div>
  );
}

// Simple utility to join classes conditionally
function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}