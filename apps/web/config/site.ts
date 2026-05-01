// packages/config/siteNav.ts
export type NavItem = {
  id: string;
  label: string;
  path: string;
  group?: "main" | "dashboard" | "footer";
  icon?: string;
  order?: number;
  visible?: boolean;
  subItems?: NavItem[];
};

export const siteNav: NavItem[] = [
  // top-level (header)
  { id: "home", label: "Insights", path: "/dashboard", group: "main", order: 0, visible: true },

  // dashboard area (sidebar)
  { id: "today", label: "Today", path: "/dashboard/today", group: "dashboard", order: 1, visible: true },
  { id: "notes", label: "Notes", path: "/dashboard/notes", group: "dashboard", order: 2, visible: true },
  { 
    id: "projects", 
    label: "Study Paths", 
    path: "/dashboard/study", 
    group: "dashboard", 
    order: 3, 
    visible: true,
    subItems: [
        { id: "journey", label: "Project Tracker", path: "/dashboard/project-tracker", group: "dashboard", visible: true },
        { id: "course-tracker", label: "Course Tracker", path: "/dashboard/course-tracker", group: "dashboard", visible: true },
        { id: "media-tracker", label: "Media Tracker", path: "/dashboard/media-tracker", group: "dashboard", visible: true },
        { id: "roadmap-tracker", label: "Roadmap Tracker", path: "/dashboard/roadmap-tracker", group: "dashboard", visible: true },
    ]
  },
  { id: "checklist", label: "Daily Checklist", path: "/dashboard/daily-checklist", group: "dashboard", order: 4, visible: true },
  { id: "insights", label: "Insights", path: "/dashboard", group: "dashboard", order: 5, visible: true },
  { id: "subscription", label: "Subscription", path: "/dashboard/subscriptions", group: "dashboard", order: 6, visible: true },
  { id: "settings", label: "Settings", path: "/dashboard/settings", group: "dashboard", order: 7, visible: false },


  // footer links
  { id: "about", label: "About", path: "/about", group: "footer", order: 100, visible: true },
];
