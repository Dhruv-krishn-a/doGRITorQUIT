"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Sparkles, X, Send, Loader2, 
  CheckCircle2, ArrowRight, BrainCircuit,
  Calendar, Clock, AlertTriangle, Lock
} from "lucide-react";
import { useToast } from "@shared/components/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

// --- Utility Helper ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Types ---
interface AIPlanRow {
  Day: number;
  "Task Title": string;
  Description: string;
  "Estimated Time (min)": number;
  Priority: "High" | "Medium" | "Low";
  Subtasks: string[];
  Tags: string;
  [key: string]: unknown;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  planData?: AIPlanRow[];
  timestamp: number;
  isError?: boolean;      
  isLimitError?: boolean; 
}

// --- Prompts ---
const SYSTEM_PROMPT = `
You are an elite Productivity Architect.
PROTOCOL:
1. Discovery (First 1-3 turns): Ask short, high-impact questions (Current skill, Time available, Deadline). Do NOT generate the plan yet.
2. Generation: When you have enough info, say "Strategy locked. Generating plan..." and output the JSON.

JSON REQUIREMENT:
Output ONLY raw JSON array.
Structure:
[
  {
    "Day": 1, 
    "Task Title": "Focus Concept",
    "Description": "Actionable summary",
    "Estimated Time (min)": 60,
    "Priority": "High",
    "Subtasks": ["Step 1", "Step 2"], 
    "Tags": "Deep Work"
  }
]
`;

export default function AIPlanGenerator() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing agent...");
  
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  
  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Initial Greeting
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: "init",
        role: "ai",
        text: "I'm ready to architect your success. What is your main goal? (e.g., 'Learn Rust', 'Launch MVP', 'Get Fit')",
        timestamp: Date.now(),
      }]);
    }
  }, [open, messages.length]);

  // Loading Text
  useEffect(() => {
    if (!loading) return;
    const texts = ["Deconstructing goal...", "Analyzing constraints...", "Optimizing critical path...", "Finalizing strategy..."];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[i % texts.length] || "Processing...");
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const extractJSON = (text: string): AIPlanRow[] | null => {
    try {
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) return JSON.parse(match[0]);
      return null;
    } catch { return null; }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add User Message
    const newHistory: ChatMessage[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", text: trimmedInput, timestamp: Date.now() }
    ];

    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const transcript = newHistory
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n\n");

      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${SYSTEM_PROMPT}\n\nTRANSCRIPT:\n${transcript}\n\nAssistant:` }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        if (res.status === 403) {
          throw { 
            isLimit: true, 
            message: errorData.error || "Free limit reached. Please upgrade to continue." 
          };
        }
        
        throw { 
          isLimit: false, 
          message: errorData.error || `System Error (${res.status})` 
        };
      }

      const data = await res.json();
      const aiText = data.text || "";
      const planData = extractJSON(aiText);

      const displayText = planData 
        ? "I've designed a high-leverage strategy for you. Review the blueprint below." 
        : aiText;

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          text: displayText,
          planData: planData || undefined,
          timestamp: Date.now(),
        }
      ]);

    } catch (err: unknown) {
       let isLimit = false;
       let message = "Something went wrong.";

       // Safe Type Guard
       if (typeof err === "object" && err !== null) {
          const errorObj = err as { isLimit?: boolean; message?: string };
          if (errorObj.isLimit) isLimit = true;
          if (errorObj.message) message = errorObj.message;
       } else if (err instanceof Error) {
          message = err.message;
       }

       if (isLimit) {
         toast.showToast({ title: "Limit Reached", message: "You've used all your free credits.", type: "error" });
       } else {
         console.error("AI System Error:", err);
         toast.showToast({ title: "Error", message: "AI service temporarily unavailable.", type: "error" });
       }
       
       setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: "ai",
         text: isLimit 
            ? "🛑 **Limit Reached:** You have used your free AI generation quota. Please upgrade your plan to generate more strategies."
            : `⚠️ **System Error:** ${message}. Please try again later.`,
         timestamp: Date.now(),
         isError: !isLimit,
         isLimitError: isLimit
       }]);

    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleGenerate = async (planData: AIPlanRow[]) => {
    try {
      const safeDate = startDate || new Date().toISOString().slice(0, 10);
      const titleSnippet = messages[1]?.text.slice(0, 20) || "New Plan";
      
      toast.showToast({ title: "Building...", message: "Constructing your timeline...", type: "info" });
      
      const res = await fetch("/api/plans/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: `Strategy: ${titleSnippet}...`,
          tasks: planData,
          startDate: safeDate, 
          isAI: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Import failed");
      }

      toast.showToast({ title: "Success", message: "Plan activated.", type: "success" });
      setOpen(false);
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      toast.showToast({ title: "Error", message: "Could not save plan.", type: "error" });
    }
  };

  return (
    <>
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)} 
        // Lighter, fresher button style
        className="group relative px-6 py-3 bg-white text-gray-700 rounded-xl inline-flex items-center gap-3 shadow-lg hover:shadow-xl transition-all border border-gray-200 overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <BrainCircuit className="w-5 h-5 relative z-10 text-indigo-600 group-hover:scale-110 transition-transform" />
        <span className="font-semibold relative z-10 tracking-wide">Generate AI Plan</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          // Lighter overlay
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              // Pure white background for main card
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-gray-100 relative"
            >
              {/* Very subtle top gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-blue-50/50 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Strategic Planner</h3>
                    <p className="text-xs text-gray-500 font-medium">Mistral Devstral • Context Aware</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                {messages.map((msg) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={cn(
                      "flex gap-4",
                      msg.role === "ai" ? "justify-start" : "justify-end"
                    )}
                  >
                    {msg.role === "ai" && (
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 border shadow-sm",
                        msg.isLimitError 
                          ? "bg-amber-50 border-amber-100"
                          : msg.isError 
                            ? "bg-red-50 border-red-100"
                            : "bg-white border-gray-100"
                      )}>
                        {msg.isLimitError ? (
                          <Lock className="w-4 h-4 text-amber-500" />
                        ) : msg.isError ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : (
                          <BrainCircuit className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[85%] space-y-3",
                      msg.role === "user" ? "items-end flex flex-col" : "items-start"
                    )}>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative overflow-hidden",
                        msg.role === "ai" 
                          ? msg.isLimitError
                            ? "bg-amber-50 border border-amber-100 text-amber-800 rounded-tl-none"
                            : msg.isError
                              ? "bg-red-50 border border-red-100 text-red-800 rounded-tl-none"
                              : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                          : "bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-indigo-200"
                      )}>
                        <p className="whitespace-pre-wrap relative z-10">{msg.text}</p>
                        
                        {msg.isLimitError && (
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <button className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                              Upgrade to Pro <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* PLAN PREVIEW CARD (Light Theme) */}
                      {msg.planData && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-md mt-2"
                        >
                          <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex gap-2 items-center text-emerald-600">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-bold text-sm">Blueprint Ready</span>
                            </div>
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                              {msg.planData.length} Days
                            </span>
                          </div>
                          
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              {msg.planData.slice(0, 3).map((task, i) => (
                                <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-indigo-200 transition-colors">
                                  <div className="flex flex-col items-center gap-1 shrink-0 w-12 pt-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Day</span>
                                    <span className="text-lg font-bold text-gray-900 leading-none">{task.Day}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{task["Task Title"]}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{task.Description}</p>
                                    <div className="flex gap-3 mt-2">
                                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {task["Estimated Time (min)"]}m
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                                  <Calendar className="w-3 h-3" /> Start Date
                                </label>
                                <input 
                                  type="date" 
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value || "")}
                                  className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                              </div>
                              <button 
                                onClick={() => msg.planData && handleGenerate(msg.planData)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                              >
                                Commit & Create Plan <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Loading State */}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      <span className="text-sm font-medium text-gray-500 animate-pulse">{loadingText}</span>
                    </div>
                  </motion.div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center group">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value || "")}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                    placeholder="Describe your goal..."
                    disabled={loading}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-14 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-400"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Send className="w-4 h-4" />
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