import { 
  Dumbbell, BookOpen, Zap, Brain, Droplet, LucideIcon,
  Heart, Sun, Moon, Coffee, Music, Briefcase, 
  Gamepad2, Utensils, BedDouble, DollarSign, Plane, 
  Monitor, Smile, Leaf, Camera, Anchor, Bike, Code
} from "lucide-react";

export const ICON_OPTIONS = [
  { category: "Health", items: [
    { value: "dumbbell", label: "Workout", component: Dumbbell },
    { value: "heart", label: "Health", component: Heart },
    { value: "droplet", label: "Water", component: Droplet },
    { value: "utensils", label: "Diet", component: Utensils },
    { value: "bed", label: "Sleep", component: BedDouble },
    { value: "bike", label: "Cardio", component: Bike },
  ]},
  { category: "Productivity", items: [
    { value: "zap", label: "Focus", component: Zap },
    { value: "briefcase", label: "Work", component: Briefcase },
    { value: "code", label: "Code", component: Code },
    { value: "monitor", label: "Screen", component: Monitor },
    { value: "dollar", label: "Finance", component: DollarSign },
  ]},
  { category: "Mind & Soul", items: [
    { value: "bookopen", label: "Read", component: BookOpen },
    { value: "brain", label: "Learn", component: Brain },
    { value: "music", label: "Music", component: Music },
    { value: "coffee", label: "Break", component: Coffee },
    { value: "sun", label: "Morning", component: Sun },
    { value: "moon", label: "Night", component: Moon },
    { value: "leaf", label: "Nature", component: Leaf },
  ]},
  { category: "Lifestyle", items: [
    { value: "gamepad", label: "Gaming", component: Gamepad2 },
    { value: "plane", label: "Travel", component: Plane },
    { value: "camera", label: "Photo", component: Camera },
    { value: "smile", label: "Mood", component: Smile },
    { value: "anchor", label: "Ground", component: Anchor },
  ]}
];

export const ALL_ICONS = ICON_OPTIONS.flatMap(g => g.items);
export const ICON_MAP: Record<string, LucideIcon> = ALL_ICONS.reduce((acc, curr) => ({ ...acc, [curr.value]: curr.component }), {});

export const COLOR_OPTIONS = [
  { name: "Indigo", class: "text-indigo-600", bg: "bg-indigo-600", light: "bg-indigo-100", border: "border-indigo-200" },
  { name: "Rose", class: "text-rose-600", bg: "bg-rose-600", light: "bg-rose-100", border: "border-rose-200" },
  { name: "Emerald", class: "text-emerald-600", bg: "bg-emerald-600", light: "bg-emerald-100", border: "border-emerald-200" },
  { name: "Amber", class: "text-amber-600", bg: "bg-amber-600", light: "bg-amber-100", border: "border-amber-200" },
  { name: "Blue", class: "text-blue-600", bg: "bg-blue-600", light: "bg-blue-100", border: "border-blue-200" },
  { name: "Violet", class: "text-violet-600", bg: "bg-violet-600", light: "bg-violet-100", border: "border-violet-200" },
  { name: "Cyan", class: "text-cyan-600", bg: "bg-cyan-600", light: "bg-cyan-100", border: "border-cyan-200" },
  { name: "Slate", class: "text-slate-600", bg: "bg-slate-600", light: "bg-slate-100", border: "border-slate-200" },
];

export const DEFAULT_COLOR = COLOR_OPTIONS[0]!;

export const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The only bad workout is the one that didn't happen.",
  "Your future is created by what you do today, not tomorrow.",
  "Discipline is choosing between what you want now and what you want most.",
  "Atomic habits lead to massive results.",
];
