export type NavItem = {
  id: string;
  label: string;
  path: string;
  group: "main" | "sidebar" | "settings";
  visible: boolean;
  order?: number;
  icon?: string;
};

export const siteNav: NavItem[] = [
  { id: "today", label: "Today", path: "/dashboard/today", group: "main", visible: true, order: 1, icon: "Zap" },
  { id: "dashboard", label: "Dashboard", path: "/dashboard", group: "main", visible: true, order: 2 },
  { id: "plans", label: "Plans", path: "/dashboard/plans", group: "main", visible: true, order: 3 },
  { id: "study", label: "Study", path: "/dashboard/study", group: "main", visible: true, order: 4 },
  { id: "analytics", label: "Analytics", path: "/dashboard/analytics", group: "main", visible: true, order: 5 },
  { id: "settings", label: "Settings", path: "/dashboard/settings", group: "settings", visible: true },
];