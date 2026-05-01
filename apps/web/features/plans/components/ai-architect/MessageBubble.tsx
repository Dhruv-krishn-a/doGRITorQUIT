"use client";

import React from "react";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  if (isSystem) {
      return (
          <div className="transform-gpu flex justify-center my-4">
              <span className="transform-gpu bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--border-color)] italic">
                  {content}
              </span>
          </div>
      );
  }

  return (
    <div className={cn("transform-gpu flex w-full mb-6 gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "transform-gpu w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
        isUser ? "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--accent-color)]" : "bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-primary)] shadow-[var(--accent-color)]/20"
      )}>
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>
      
      <div className={cn(
        "transform-gpu max-w-[85%] px-5 py-4 rounded-3xl text-sm font-bold shadow-sm italic leading-relaxed",
        isUser 
          ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tr-none" 
          : "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none"
      )}>
        {content}
      </div>
    </div>
  );
}
