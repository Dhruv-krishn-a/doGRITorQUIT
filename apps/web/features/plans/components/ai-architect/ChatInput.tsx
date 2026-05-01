"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export interface ChatInputProps {
  onSend: (message: string) => void;
  onStartPlan?: (topic: string, days: number, level: SkillLevel) => void; 
  disabled?: boolean;
}

export function ChatInput({ onSend, onStartPlan, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State
  const [topic, setTopic] = useState("");
  const [days, setDays] = useState(30);
  const [level, setLevel] = useState<SkillLevel>("Beginner");

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  const handlePlanSubmit = () => {
    if (!topic.trim() || disabled) return;
    
    if (onStartPlan) {
      onStartPlan(topic, days, level);
    } else {
      onSend(`Create a ${days}-day ${level} plan for ${topic}`);
    }
    
    setTopic("");
    setShowSettings(false);
  };

  return (
    <div className="transform-gpu relative">
      
      {/* --- Settings Popover --- */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="transform-gpu absolute bottom-full mb-4 left-0 w-full md:w-96 bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-color)] p-6 z-20 overflow-hidden"
            ref={settingsRef}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--accent-color)]/5 pointer-events-none" />
            
            <div className="transform-gpu relative z-10">
                <div className="transform-gpu flex justify-between items-center mb-6">
                    <h4 className="transform-gpu font-black text-[var(--text-primary)] flex items-center gap-2 uppercase italic tracking-tighter leading-none">
                        <SlidersHorizontal size={18} className="transform-gpu text-[var(--accent-color)]"/> 
                        Plan Builder
                    </h4>
                    <button onClick={() => setShowSettings(false)} className="transform-gpu p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all active:scale-95">
                        <X size={18} />
                    </button>
                </div>

                <div className="transform-gpu space-y-6">
                {/* Topic Input */}
                <div>
                    <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 block ml-1 italic opacity-40">
                        Primary Objective
                    </label>
                    <input 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="E.G. LEARN REACT NATIVE..."
                        className="transform-gpu w-full !bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner italic uppercase tracking-tight"
                        autoFocus
                    />
                </div>

                {/* Experience Level Selector */}
                <div>
                    <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 block ml-1 italic opacity-40">
                        Difficulty Profile
                    </label>
                    <div className="transform-gpu grid grid-cols-3 gap-2 p-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-inner">
                        {(["Beginner", "Intermediate", "Advanced"] as SkillLevel[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLevel(l)}
                            className={`text-[10px] font-black py-2.5 rounded-xl transition-all uppercase italic tracking-widest ${
                            level === l 
                                ? "bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg" 
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                            {l}
                        </button>
                        ))}
                    </div>
                </div>

                {/* Duration Slider */}
                <div>
                    <div className="transform-gpu flex justify-between items-end mb-4 px-1">
                        <label className="transform-gpu text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic opacity-40">
                            Temporal Horizon
                        </label>
                        <span className="transform-gpu text-[var(--accent-color)] font-black text-xs uppercase italic">
                            {days} Days
                        </span>
                    </div>
                    <div className="px-2">
                        <input 
                            type="range" 
                            min="3" 
                            max="60" 
                            value={days} 
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="transform-gpu w-full accent-[var(--accent-color)] h-1.5 bg-[var(--bg-secondary)] rounded-full appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handlePlanSubmit}
                    disabled={!topic.trim() || disabled}
                    className="transform-gpu w-full py-5 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all flex items-center justify-center gap-3 active:scale-95 italic"
                >
                    <Sparkles size={16} /> Synthesize Blueprint
                </button>
                </div>
            </div>
            
            {/* Arrow Pointer */}
            <div className="transform-gpu absolute -bottom-2 left-8 w-4 h-4 bg-[var(--bg-card)] border-b border-r border-[var(--border-color)] rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Input Bar --- */}
      <div className="transform-gpu flex items-center gap-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all border shrink-0 ${
            showSettings 
              ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg" 
              : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)]/50 shadow-inner"
          }`}
          title="Open Plan Builder"
        >
          <SlidersHorizontal size={20} />
        </button>

        <div className="flex-1 relative group">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message or use the builder..."
                className="transform-gpu w-full !bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4.5 text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)] transition-all outline-none shadow-inner disabled:opacity-50 placeholder:text-[var(--text-secondary)]/30 italic"
                disabled={disabled}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                    className="p-3 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
