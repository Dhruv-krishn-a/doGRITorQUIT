// apps/web/features/plans/components/AIPlanGenerator.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Sparkles, X, Send, Loader2, 
  CheckCircle2, BrainCircuit
} from "lucide-react";
import { useToast } from "@shared/components/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

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
  role: "user" | "ai";
  text: string;
  planData?: AIPlanItem[]; 
  timestamp: number;
  isError?: boolean;      
  isLimitError?: boolean; 
}

interface AIError {
    message?: string;
    isLimit?: boolean;
}

export default function AIPlanGenerator() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0); 

  
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  
  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, loadingStep]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setElapsedTime(0);
      setLoadingStep(0);
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        // Simulate progress bar slowing down as it reaches 90%
        setLoadingStep(prev => prev + (prev < 30 ? 5 : prev < 70 ? 2 : prev < 90 ? 0.5 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const newHistory: ChatMessage[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", text: trimmedInput, timestamp: Date.now() }
    ];

    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedInput }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Throw a structured object we can type-check in catch block
        throw { 
          isLimit: res.status === 403, 
          message: errorData.error || "Generation failed" 
        };
      }

      const responseBody = await res.json();
      const planData = responseBody.data; 

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          text: "Plan generated successfully. Please set a start date below to activate it.",
          planData: planData, 
          timestamp: Date.now(),
        }
      ]);

    } catch (err: unknown) {
       // Safe type checking for unknown error
       let errorMessage = "Failed to generate";
       let isLimit = false;

       if (typeof err === "object" && err !== null) {
         const errorObj = err as AIError;
         if (errorObj.message) errorMessage = errorObj.message;
         if (errorObj.isLimit) isLimit = errorObj.isLimit;
       }

       setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: "ai",
         text: isLimit 
            ? "🛑 **Limit Reached:** Please upgrade your plan."
            : `⚠️ **Error:** ${errorMessage}.`,
         timestamp: Date.now(),
         isError: true,
         isLimitError: isLimit
       }]);
    } finally {
      setLoading(false);
      setLoadingStep(100);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

const handleGenerate = async (planData: AIPlanItem[]) => {
    if (!startDate) {
        toast.showToast({ title: "Date Required", message: "Please select a start date", type: "error" });
        return;
    }

    try {
      toast.showToast({ title: "Saving...", message: "Creating your plan...", type: "info" });
      
      const lastUserMsg = messages.filter(m => m.role === "user").pop();
      const planName = `AI Plan: ${lastUserMsg?.text.slice(0, 20) || "Goal"}...`;

      const res = await fetch("/api/plans/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          tasks: planData,
          startDate: startDate, 
          isAI: true,
        }),
      });

      // FIX: Check response status and parse error message
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // If it's a 403, it's usually a limit issue
        if (res.status === 403) {
            throw new Error(errorData.error || "Plan limit reached. Delete an old plan to save this one.");
        }
        throw new Error(errorData.error || "Import failed");
      }

      toast.showToast({ title: "Success", message: "Plan activated.", type: "success" });
      setOpen(false);
      window.location.reload(); 
      
    } catch (err) {
      console.error("Save Plan Error:", err);
      // FIX: Show the specific error message from the server
      const errorMessage = err instanceof Error ? err.message : "Could not save plan.";
      toast.showToast({ title: "Save Failed", message: errorMessage, type: "error" });
    }
  };

  return (
    <>
      <motion.button 
        onClick={() => setOpen(true)} 
        className="group relative px-6 py-3 bg-white text-gray-700 rounded-xl inline-flex items-center gap-3 shadow-sm hover:shadow-md transition-all border border-gray-200"
      >
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span className="font-semibold text-sm">AI Planner</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-800">AI Strategy Generator</h3>
                </div>
                <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {messages.length === 0 && (
                   <div className="text-center mt-20 text-gray-400">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>What do you want to achieve?</p>
                   </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-3", msg.role === "ai" ? "" : "flex-row-reverse")}>
                     {/* Message Bubbles */}
                     <div className={cn(
                        "p-4 rounded-2xl max-w-[85%] text-sm",
                        msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                     )}>
                        {msg.text}
                        
                        {/* PREVIEW CARD */}
                        {msg.planData && (
                          <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm text-left">
                            <div className="flex justify-between items-center mb-4">
                               <h4 className="font-bold text-gray-900">Plan Preview</h4>
                               <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                 {msg.planData.length} items generated
                               </span>
                            </div>

                            <div className="mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">
                                    When do you want to start?
                                </label>
                                <input 
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-white border border-indigo-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <button 
                                onClick={() => handleGenerate(msg.planData!)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Import to Calendar
                            </button>
                          </div>
                        )}
                     </div>
                  </div>
                ))}

                {/* LOADING STATE */}
                {loading && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[80%]">
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                         <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating Strategy...</span>
                         </div>
                         
                         {/* Progress Bar */}
                         <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                               className="bg-indigo-500 h-full rounded-full"
                               initial={{ width: "0%" }}
                               animate={{ width: `${loadingStep}%` }}
                               transition={{ type: "spring", stiffness: 50 }}
                            />
                         </div>

                         <div className="flex justify-between text-xs text-gray-400 font-mono">
                            <span>Thinking...</span>
                            <span>{elapsedTime}s / ~25s</span>
                         </div>
                      </div>
                   </motion.div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-gray-50">
                <div className="relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                    placeholder="Describe your goal (e.g., Learn Spanish in 30 days)..."
                    disabled={loading}
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
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