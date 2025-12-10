// packages/config/siteNav.ts
export type NavItem = {
  id: string;
  label: string;
  path: string;
  group?: "main" | "dashboard" | "footer";
  icon?: string; // optional, we can map to icon components
  order?: number;
  visible?: boolean;
};

export const siteNav: NavItem[] = [
  // top-level (header)
  { id: "home", label: "Home", path: "/dashboard", group: "main", order: 0, visible: true },

  // dashboard area (sidebar)
  { id: "dashboard", label: "Dashboard", path: "/dashboard", group: "dashboard", order: 1, visible: true },
  { id: "plans", label: "Plans", path: "/dashboard/plans", group: "dashboard", order: 2, visible: true },
  { id: "tasks", label: "Tasks", path: "/dashboard/tasks", group: "dashboard", order: 3, visible: true },
  { id: "checklist", label: "Daily Checklist", path: "/dashboard/daily-checklist", group: "dashboard", order: 4, visible: true },
  { id: "analytics", label: "Analytics", path: "/dashboard/analytics", group: "dashboard", order: 5, visible: true },

  // footer links
  { id: "about", label: "About", path: "/about", group: "footer", order: 100, visible: true },
];
