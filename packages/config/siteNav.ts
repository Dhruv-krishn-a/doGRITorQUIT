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
  { id: "dashboard", label: "Dashboard", path: "/dashboard", group: "main", visible: true, order: 1 },
  { id: "plans", label: "Plans", path: "/dashboard/plans", group: "main", visible: true, order: 2 },
  { id: "analytics", label: "Analytics", path: "/dashboard/analytics", group: "main", visible: true, order: 3 },
  { id: "settings", label: "Settings", path: "/settings", group: "settings", visible: true },
];