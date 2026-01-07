"use client";
import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useToast } from "@shared/components/ToastProvider";

interface AIPlanRow {
  Day?: number | string;
  "Task Title"?: string;
  Subtasks?: string[];
  Priority?: string;
  Notes?: string;
  "Expected Hours"?: number | string;
  [key: string]: unknown;
}

interface ChatMessage {
  id: string;
  text: string;
  isAI: boolean;
  planData?: AIPlanRow[];
}

export default function AIPlanGenerator() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Initialize with today's date string (YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0] as string);
  
  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);

  // ✅ FIX: Added messages.length dependency
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: Date.now().toString(),
        text: "Hello! Describe your goal and timeframe and I'll generate a plan for you.",
        isAI: true,
      }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractJSON = (text: string): AIPlanRow[] | null => {
    try {
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) return JSON.parse(match[0]) as AIPlanRow[];
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed as AIPlanRow[];
    } catch { return null; }
    return null;
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), text: trimmedInput, isAI: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const SYSTEM_PROMPT = `
      You are an expert planning assistant.
      Create a detailed plan based on the user's request.
      
      CRITICAL: Output ONLY a raw JSON array.
      
      Structure per item:
      {
        "Day": 1, 
        "Task Title": "Main Goal of the Day",
        "Description": "Brief summary",
        "Estimated Time (min)": 60,
        "Priority": "High",
        "Subtasks": ["Specific Action 1", "Specific Action 2", "Specific Action 3"], 
        "Tags": "Tag1, Tag2"
      }
      
      Ensure "Subtasks" is an ARRAY of strings, not a single string.
    `;

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            prompt: `${SYSTEM_PROMPT}\n\nUser Request: ${trimmedInput}\n\nJSON Output:` 
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      const aiText = data?.text ?? JSON.stringify(data?.raw ?? "No response");
      const planData = extractJSON(aiText);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: planData ? "I've generated a plan! Review the data, pick a Start Date below, and click Create." : aiText,
        isAI: true,
        planData: planData || undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 3).toString(),
        text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        isAI: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (planData?: AIPlanRow[]) => {
    if (!planData || planData.length === 0) return;

    try {
      // ✅ FIX: Safely construct date object
      const safeDate = startDate ? new Date(startDate) : new Date();
      
      const res = await fetch("/api/plans/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: `AI Plan - ${safeDate.toLocaleDateString()}`,
          tasks: planData,
          startDate: startDate, 
          isAI: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Import failed");
      }

      toast.showToast({ title: "Success", message: "Plan created!", type: "success" });
      setOpen(false);
      setMessages([]);
      window.location.reload(); 
    } catch (error) {
      toast.showToast({ title: "Error", message: String(error), type: "error" });
    }
  };

  return (
    <>
      {/* ✅ FIX: Updated Tailwind gradient syntax */}
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg inline-flex items-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-colors">
        <MessageSquare className="w-4 h-4" />
        <span className="font-medium">AI Assistant</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* ✅ FIX: Updated Tailwind gradient syntax */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-purple-50 to-blue-50">
              <h3 className="text-lg font-bold text-gray-900">AI Planner</h3>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* ✅ FIX: Replaced arbitrary h-[400px] with h-100 */}
              <div className="p-4 h-100 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAI ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${msg.isAI ? "bg-gray-100 text-gray-800" : "bg-blue-600 text-white"}`}>
                      <pre className="whitespace-pre-wrap font-sans text-sm">{msg.text}</pre>
                      
                      {msg.planData && (
                        <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200 text-gray-900 shadow-sm">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                          <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border rounded p-2 text-sm mb-3"
                          />
                          <button 
                            onClick={() => handleGenerate(msg.planData)}
                            className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors"
                          >
                            Confirm & Create Plan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 p-2 border rounded-lg"
                placeholder="Type your goal..."
                disabled={loading}
              />
              <button onClick={handleSend} disabled={loading} className="px-4 bg-blue-600 text-white rounded-lg">
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}