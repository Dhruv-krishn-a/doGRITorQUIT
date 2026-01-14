// apps/web/shared/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteNav } from "../../../../packages/config/siteNav";
import { Lock } from "lucide-react"; // Make sure you have this icon

// Define permissions interface matching domain output
export interface SidebarPermissions {
  canViewDashboard: boolean;
  canViewPlans: boolean;
  canViewTasks: boolean;
  canViewChecklist: boolean;
  canViewAnalytics: boolean;
  canViewSubscription: boolean;
}

// Map paths to permission keys
const PATH_TO_PERM: Record<string, keyof SidebarPermissions> = {
  "/dashboard": "canViewDashboard",
  "/dashboard/plans": "canViewPlans",
  "/dashboard/tasks": "canViewTasks",
  "/dashboard/checklist": "canViewChecklist",
  "/dashboard/analytics": "canViewAnalytics",
  "/dashboard/subscriptions": "canViewSubscription",
};

export default function Sidebar({ permissions }: { permissions?: SidebarPermissions }) {
  const pathname = usePathname();
  const dashboardNav = siteNav
    .filter((n) => n.group === "dashboard" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Deterministic initial state so server HTML matches client initial render.
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Read persisted preference on client after mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ui.sidebarCollapsed");
      if (raw !== null) {
        setCollapsed(raw === "true");
      }
    } catch {
      // Ignore localStorage read errors (privacy mode, etc.)
    }
  }, []);

  // Persist preference whenever collapsed changes (client-only)
  useEffect(() => {
    try {
      localStorage.setItem("ui.sidebarCollapsed", String(collapsed));
    } catch {
      // Ignore write errors
    }
  }, [collapsed]);

  return (
    <aside
      className={`bg-white border-r transition-all duration-200 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1">
            {!collapsed ? <div className="text-lg font-semibold">Planner</div> : <div className="text-lg">P</div>}
          </div>
          <button
            onClick={() => setCollapsed((s) => !s)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Toggle sidebar"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="flex-1 px-1 py-2 overflow-auto">
          {dashboardNav.map((item) => {
            const active = pathname === item.path;

            // Determine if item is allowed
            // If permissions aren't loaded yet (undefined), default to ALLOW to avoid flickering lock
            // or BLOCK if you prefer strictness. Here we default true to be safe during loading.
            const permKey = PATH_TO_PERM[item.path];
            const isAllowed = permissions && permKey ? permissions[permKey] : true;

            if (!isAllowed) {
              // 🔒 LOCKED ITEM
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md my-1 mx-2 text-slate-400 cursor-not-allowed opacity-70 group relative"
                  title="Upgrade to unlock"
                >
                  <div className="w-6 text-center">{item.label[0]}</div>
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      {item.label}
                      <Lock size={14} className="text-slate-400" />
                    </div>
                  )}
                  {collapsed && <Lock size={12} className="absolute top-1 right-1" />}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md my-1 mx-2 transition-colors ${
                  active ? "bg-slate-100 text-blue-600" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="w-6 text-center font-medium">{item.label[0]}</div>
                {!collapsed && <div className="flex-1">{item.label}</div>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          {!collapsed ? <div className="text-xs text-slate-500">v1.0.0</div> : <div className="text-xs">v1</div>}
        </div>
      </div>
    </aside>
  );
}
