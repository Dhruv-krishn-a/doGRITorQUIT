"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles, X, Send, Loader2,
  BrainCircuit, User, Bot, RefreshCw,
  Calendar as CalendarIcon, ArrowRight, FileText, Edit3
} from "lucide-react";
import { useToast } from "@shared/components/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- Utility Components ---

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function GenerationTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="text-xs font-mono text-emerald-600">({seconds}s)</span>;
}

// --- Types ---

interface AIPlanItem {
  Day: number;
  "Task Title": string;
  Description: string;
  "Estimated Time (min)": number;
  Priority?: string;
  Subtasks?: string[];
  [key: string]: unknown;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  planData?: AIPlanItem[] | null;
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function assistantDisplayContent(raw: string) {
  const idx = raw.indexOf("```json");
  if (idx === -1) return raw;
  return raw.slice(0, idx).trim();
}

function mapPlanToDates(plan: AIPlanItem[], startISO: string) {
  const start = new Date(startISO + "T00:00:00");
  return plan.map(item => {
    const dayVal = Number(item.Day) || 1;
    const dayOffset = Math.max(0, dayVal - 1);
    const d = new Date(start);
    d.setDate(d.getDate() + dayOffset);
    
    return {
      ...item,
      "Task Title": item["Task Title"] || "Untitled Task",
      "Estimated Time (min)": Number(item["Estimated Time (min)"]) || 30,
      Subtasks: Array.isArray(item.Subtasks) ? item.Subtasks : [],
      date: d.toISOString()
    };
  });
}

// --- Main Component ---

export default function AIPlanGenerator() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  
  // UX States
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Plan Settings
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [planTitle, setPlanTitle] = useState(""); // ✅ New Editable Title State

  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Reset on open
  useEffect(() => {
    if (open) {
      setMessages([]); 
      setInput("");
      setLoading(false);
      setIsSaving(false);
      setPlanTitle("");
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ Auto-generate a smart title when a plan appears
  useEffect(() => {
    const lastMsg = messages.at(-1);
    if (lastMsg?.planData && !planTitle) {
      // Find the FIRST user message (usually contains the goal)
      const firstUserMsg = messages.find(m => m.role === "user");
      const smartTitle = firstUserMsg 
        ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "")
        : "My AI Plan";
      setPlanTitle(smartTitle);
    }
  }, [messages, planTitle]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = { id: genId(), role: "user", content: input };
    const newHistory = [...messages, newMsg];

    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await res.json().catch(() => ({ message: "", planData: null }));

      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to generate");

      const assistantMsg: ChatMessage = {
        id: genId(),
        role: "assistant",
        content: typeof data.message === "string" ? data.message : (data?.rawText ?? ""),
        planData: Array.isArray(data.planData) && data.planData.length > 0 ? data.planData : null,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      setMessages(prev => [...prev, {
        id: genId(),
        role: "assistant",
        content: `⚠️ Error: ${errorMessage}`,
        planData: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (planData: AIPlanItem[]) => {
    if (!startDate) {
      toast.showToast({ title: "Date missing", message: "Select a start date", type: "error" });
      return;
    }
    if (!planTitle.trim()) {
       toast.showToast({ title: "Title missing", message: "Please name your plan", type: "error" });
       return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const tasksToSend = mapPlanToDates(planData, startDate);

      const res = await fetch("/api/plans/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planTitle, // ✅ Use the custom title
          tasks: tasksToSend,
          startDate,
          isAI: true
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Import failed");

      toast.showToast({ title: "Success", message: "Plan created!", type: "success" });
      setOpen(false);
      router.refresh();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not save plan";
      toast.showToast({ title: "Save Failed", message: msg, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
      >
        <Sparkles size={16} /> AI Architect
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Plan Architect</h3>
                    <p className="text-xs text-slate-500 font-medium">Build your roadmap with AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => setMessages([])} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full" title="Reset">
                     <RefreshCw size={18} />
                   </button>
                   <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full">
                     <X size={20} />
                   </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Sparkles size={64} className="mb-6 text-indigo-300" />
                    <h4 className="text-2xl font-bold text-slate-700">What are we building?</h4>
                    <p className="text-slate-500 mt-2">e.g., &quot;React in 60 days&quot; or &quot;Marathon Training&quot;</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "")}>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm", msg.role === "user" ? "bg-white border-indigo-100 text-indigo-600" : "bg-emerald-600 border-emerald-600 text-white")}>
                      {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                    </div>

                    <div className={cn("max-w-[85%] space-y-4", msg.role === "user" ? "items-end flex flex-col" : "")}>
                      <div className={cn("px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap", msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none")}>
                        {msg.role === "assistant" ? assistantDisplayContent(msg.content) : msg.content}
                      </div>

                      {/* Plan Preview Card */}
                      {msg.planData && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full max-w-md bg-white rounded-xl border border-indigo-100 shadow-xl overflow-hidden ring-4 ring-indigo-50/50"
                        >
                          <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-4 text-white">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 opacity-90">
                                    <FileText size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Blueprint Ready</span>
                                </div>
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-mono font-bold">
                                    {msg.planData.length} Days
                                </span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight">Generated Strategy</h4>
                          </div>
                          
                          <div className="p-5 bg-white">
                            {/* ✅ NEW: Editable Title Input */}
                            <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan Name</label>
                              <div className="relative">
                                <input 
                                  value={planTitle}
                                  onChange={(e) => setPlanTitle(e.target.value)}
                                  className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                                  placeholder="Name your plan..."
                                />
                                <Edit3 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
                              {msg.planData.map((t, i) => (
                                <div key={i} className="flex gap-3 items-start group">
                                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {t.Day}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{t["Task Title"]}</p>
                                    <p className="text-xs text-slate-500 truncate">{t.Description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Date</label>
                              <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => msg.planData && handleImport(msg.planData)}
                                    disabled={isSaving}
                                    className="flex-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            Save Plan <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-3">
                      <Loader2 size={18} className="animate-spin text-emerald-600" />
                      <span className="text-sm text-slate-600 font-medium">
                        Designing strategy... <GenerationTimer />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-inner"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="h-13.5 w-13.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <Send size={22} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}