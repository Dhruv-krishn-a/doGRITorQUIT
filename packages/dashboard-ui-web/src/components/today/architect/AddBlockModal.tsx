"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Briefcase,
  Moon,
  Dumbbell,
  Coffee,
  Car,
  Laptop,
  Utensils,
  BookOpen,
  Heart,
  Flame,
  Gamepad,
  Tv,
  Music,
  Users,
  MessageCircle,
  Phone,
  Plane,
  Bus,
  Settings,
  Brain,
  ChevronRight,
  Play,
  Zap,
  ListTodo,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// --- Types & Constants ---
export const ICON_LIST = [
  { id: "Briefcase", icon: Briefcase, label: "Work" },
  { id: "Moon", icon: Moon, label: "Sleep" },
  { id: "Dumbbell", icon: Dumbbell, label: "Gym" },
  { id: "Coffee", icon: Coffee, label: "Break" },
  { id: "Car", icon: Car, label: "Travel" },
  { id: "Laptop", icon: Laptop, label: "Code" },
  { id: "Utensils", icon: Utensils, label: "Food" },
  { id: "BookOpen", icon: BookOpen, label: "Study" },
  { id: "Heart", icon: Heart, label: "Health" },
  { id: "Flame", icon: Flame, label: "Focus" },
  { id: "Gamepad", icon: Gamepad, label: "Game" },
  { id: "Tv", icon: Tv, label: "TV" },
  { id: "Music", icon: Music, label: "Music" },
  { id: "Users", icon: Users, label: "Social" },
  { id: "MessageCircle", icon: MessageCircle, label: "Chat" },
  { id: "Phone", icon: Phone, label: "Call" },
  { id: "Plane", icon: Plane, label: "Flight" },
  { id: "Bus", icon: Bus, label: "Bus" },
  { id: "Settings", icon: Settings, label: "Admin" },
  { id: "Brain", icon: Brain, label: "Deep" },
];

const parseTimeToMinutes = (timeStr: string, ampm: string) => {
  let [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const formatMinutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, "0");
  return { time: `${displayH}:${displayM}`, ampm };
};

const parse24hToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
};

// --- Shared Components ---
function TimeInput({ label, time, ampm, onTimeChange, onAmpmChange }: any) {
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="09:00"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="flex-1 min-w-0 px-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl outline-none focus:border-[var(--accent-color)] text-sm font-black transition-all"
        />
        <button
          type="button"
          onClick={() => onAmpmChange(ampm === "AM" ? "PM" : "AM")}
          className="w-16 shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-black text-xs hover:border-[var(--accent-color)] transition-all flex items-center justify-center text-[var(--text-primary)]"
        >
          {ampm}
        </button>
      </div>
    </div>
  );
}

// --- Main Modal ---
export function AddBlockModal({
  onClose,
  onSaveAll,
  initialStartTime,
  dayStartHour = 23,
  goals = [],
  selectedGoalIds = [],
  onToggleGoal,
}: {
  onClose: () => void;
  onSaveAll: (blocks: any[]) => void;
  initialStartTime?: number;
  dayStartHour?: number;
  goals?: any[];
  selectedGoalIds?: string[];
  onToggleGoal?: (id: string) => void;
}) {
  const [pendingBlocks, setPendingBlocks] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  // Initialize time from initialStartTime if provided
  const initialTimeObj =
    initialStartTime !== undefined
      ? formatMinutesToTime(initialStartTime)
      : { time: "09:00", ampm: "AM" };
  const initialEndTimeObj =
    initialStartTime !== undefined
      ? formatMinutesToTime((initialStartTime + 60) % 1440)
      : { time: "05:00", ampm: "PM" };

  const [startTime, setStartTime] = useState(initialTimeObj.time);
  const [startAmpm, setStartAmpm] = useState(initialTimeObj.ampm);
  const [endTime, setEndTime] = useState(initialEndTimeObj.time);
  const [endAmpm, setEndAmpm] = useState(initialEndTimeObj.ampm);
  const [icon, setIcon] = useState("Briefcase");

  const handleAddToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const sMins = parseTimeToMinutes(startTime, startAmpm);
    const eMins = parseTimeToMinutes(endTime, endAmpm);
    const formatH = (m: number) =>
      Math.floor(m / 60)
        .toString()
        .padStart(2, "0");
    const formatM = (m: number) => (m % 60).toString().padStart(2, "0");

    const newBlock = {
      id: Math.random().toString(),
      title: title.trim(),
      start: `${formatH(sMins)}:${formatM(sMins)}`,
      end: `${formatH(eMins)}:${formatM(eMins)}`,
      icon,
    };

    setPendingBlocks((prev) => {
      const next = [...prev, newBlock];
      // Sort blocks by shifted start time
      return next.sort((a, b) => {
        const aMins = parse24hToMinutes(a.start);
        const bMins = parse24hToMinutes(b.start);
        const aShifted = (aMins - dayStartHour * 60 + 1440) % 1440;
        const bShifted = (bMins - dayStartHour * 60 + 1440) % 1440;
        return aShifted - bShifted;
      });
    });

    setTitle("");
    toast.success(`Queued: ${title}`);
  };

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        className="w-full max-w-5xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl relative pointer-events-auto flex flex-col lg:flex-row overflow-hidden max-h-[90vh] z-10"
      >
        {/* Left Panel: Editor */}
        <div className="flex-1 min-w-0 p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tightest mb-1 text-[var(--text-primary)]">
                Daily Architect
              </h2>
              <p className="text-[var(--text-secondary)] font-medium text-xs sm:text-sm">
                Design your day's non-negotiable pillars.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-[var(--bg-secondary)] hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all text-[var(--text-secondary)]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleAddToList} className="space-y-6">
            {goals.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] ml-1">
                  Today's Objectives
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                  {goals.map((goal) => {
                    const isSelected = selectedGoalIds.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => onToggleGoal?.(goal.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          isSelected
                            ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md"
                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]"
                        }`}
                      >
                        {goal.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] ml-1">
                Pillar Identity
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep Work, Gym, Sleep"
                className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl outline-none focus:border-[var(--accent-color)] text-base font-bold transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TimeInput
                label="Begins At"
                time={startTime}
                ampm={startAmpm}
                onTimeChange={setStartTime}
                onAmpmChange={setStartAmpm}
              />
              <TimeInput
                label="Ends At"
                time={endTime}
                ampm={endAmpm}
                onTimeChange={setEndTime}
                onAmpmChange={setEndAmpm}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] ml-1">
                Visual Marker
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
                {ICON_LIST.map((i) => (
                  <button
                    type="button"
                    key={i.id}
                    onClick={() => setIcon(i.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${icon === i.id ? "bg-[var(--accent-color)] text-white shadow-lg scale-105 z-10" : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)]"}`}
                    title={i.label}
                  >
                    <i.icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-primary)] rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              <Plus size={18} /> Queue This Pillar
            </button>
          </form>
        </div>

        {/* Right Panel: Preview */}
        <div className="w-full lg:w-[380px] lg:min-w-[380px] flex-shrink-0 bg-[var(--bg-secondary)]/40 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Your Timeline
              </h3>
              <span className="px-3 py-1 bg-[var(--accent-color)] text-white rounded-full text-[10px] font-black shadow-md">
                {pendingBlocks.length} Pillars
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] lg:max-h-[360px] overflow-y-auto custom-scrollbar pr-1 mb-6">
              <AnimatePresence mode="popLayout">
                {pendingBlocks.map((b) => {
                  const s = formatMinutesToTime(parse24hToMinutes(b.start));
                  const e = formatMinutesToTime(parse24hToMinutes(b.end));
                  const Icon =
                    ICON_LIST.find((i) => i.id === b.icon)?.icon || Briefcase;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={b.id}
                      className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm flex items-center justify-between group transition-all hover:border-[var(--accent-color)]/30 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-[var(--accent-color)] shadow-inner shrink-0">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs tracking-tight truncate text-[var(--text-primary)]">
                            {b.title}
                          </h4>
                          <p className="text-[9px] font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-widest">
                            {s.time} {s.ampm} — {e.time} {e.ampm}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setPendingBlocks((p) =>
                            p.filter((x) => x.id !== b.id),
                          )
                        }
                        className="p-2 text-rose-500 opacity-60 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-lg shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {pendingBlocks.length === 0 && (
                <div className="h-44 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-40 text-center py-6">
                  <Calendar size={48} strokeWidth={1.2} className="mb-3" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Timeline Empty
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={pendingBlocks.length === 0}
            onClick={() => onSaveAll(pendingBlocks)}
            className="w-full py-4.5 bg-[var(--accent-color)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
          >
            Deploy Schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
}
