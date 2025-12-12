// apps/web/app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteNav } from "../../../../packages/config/siteNav";

export default function Sidebar() {
  const pathname = usePathname();
  const dashboardNav = siteNav
    .filter((n) => n.group === "dashboard" && n.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return false;
      const raw = localStorage.getItem("ui.sidebarCollapsed");
      return raw === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ui.sidebarCollapsed", String(collapsed));
    } catch {
      // Ignore write errors (e.g. storage full or disabled)
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
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md my-1 mx-2 ${
                  active ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                {/* simple icon placeholder */}
                <div className="w-6 text-center">{item.label[0]}</div>
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