export type NavItem = {
  id: string;
  label: string;
  path: string;
  group?: "main" | "dashboard" | "footer";
  icon?: string; // optional, we can map to icon components
  order?: number;
  visible?: boolean;
  subItems?: NavItem[];
};

export const siteNav: NavItem[] = [
  // top-level (header)
  { id: "home", label: "Insights", path: "/", group: "main", order: 0, visible: true },

  // dashboard area (sidebar)
  { id: "today", label: "Today", path: "/today", group: "dashboard", order: 1, visible: true },
  { id: "notes", label: "Notes", path: "/notes", group: "dashboard", order: 2, visible: true },
  { 
    id: "projects", 
    label: "Study Paths", 
    path: "/study", 
    group: "dashboard", 
    order: 3, 
    visible: true,
    subItems: [
        { id: "project-tracker", label: "Project Tracker", path: "/project-tracker", group: "dashboard", visible: true },
        { id: "course-tracker", label: "Course Tracker", path: "/course-tracker", group: "dashboard", visible: true },
        { id: "media-tracker", label: "Media Tracker", path: "/media-tracker", group: "dashboard", visible: true },
        { id: "roadmap-tracker", label: "Roadmap Tracker", path: "/roadmap-tracker", group: "dashboard", visible: true },
    ]
  },
  { id: "checklist", label: "Daily Checklist", path: "/daily-checklist", group: "dashboard", order: 4, visible: true },
  { id: "insights", label: "Insights", path: "/", group: "dashboard", order: 5, visible: true },
  { id: "subscriptions", label: "Subscriptions", path: "/subscriptions", group: "dashboard", order: 6, visible: true },
  { id: "settings", label: "Settings", path: "/settings", group: "dashboard", order: 7, visible: false },

  // footer links
  { id: "about", label: "About", path: "/about", group: "footer", order: 100, visible: true },
];
