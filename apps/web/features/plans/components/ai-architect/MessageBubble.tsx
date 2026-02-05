//apps/web/features/plans/components/ai-architect/MessageBubble.tsx
import React from "react";
import { Bot, User } from "lucide-react";

// ✅ FIX: Simple local utility to join class names (No external import needed)
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  // Strip out the JSON block for display purposes
  const displayContent = content.replace(/```json[\s\S]*```/, "").trim();

  // If the message was JUST json (empty after strip), don't render an empty bubble
  if (!displayContent) return null;

  const isUser = role === "user";

  return (
    <div className={cn("flex gap-4 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm mt-1",
        isUser ? "bg-white border-indigo-100 text-indigo-600" : "bg-emerald-600 border-emerald-600 text-white"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div className={cn(
        "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap max-w-[85%]",
        isUser 
          ? "bg-indigo-600 text-white rounded-tr-none" 
          : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
      )}>
        {displayContent}
      </div>
    </div>
  );
}