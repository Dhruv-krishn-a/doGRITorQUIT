"use client";
import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface AIPlanRow {
  Day?: number | string;
  "Task Title"?: string;
  Subtasks?: string;
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
  const [apiKey, setApiKey] = useState("");
  const toast = useToast();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          text: apiKey
            ? "Hello! Describe your goal and timeframe and I'll generate a plan for you."
            : "Please add your Google Gemini API key (Settings) to use the AI Plan Generator.",
          isAI: true,
        },
      ]);
    }
  }, [open, apiKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractJSON = (text: string): AIPlanRow[] | null => {
    try {
      // Try to find JSON array in the response
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        return JSON.parse(match[0]) as AIPlanRow[];
      }
      
      // Try parsing the entire text
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed as AIPlanRow[];
      }
    } catch {
      return null;
    }
    return null;
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !apiKey) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedInput,
      isAI: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a planning assistant. Convert the user request into a structured plan.
                
Output format (JSON array only, no other text):
[
  {
    "Day": 1,
    "Task Title": "Task name",
    "Subtasks": "Subtask1; Subtask2",
    "Priority": "High/Medium/Low",
    "Notes": "Additional notes",
    "Expected Hours": 2
  }
]

Rules:
- "Subtasks" should be semicolon-separated
- "Expected Hours" should be a number (hours)
- Include all tasks needed to complete the goal

User request: ${trimmedInput}

AI Response:`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `API request failed (${response.status})`);
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
      const planData = extractJSON(aiText);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: planData 
          ? "I've generated a plan for you! You can review and create it below."
          : aiText,
        isAI: true,
        planData: planData || undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (planData) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: `\`\`\`json\n${JSON.stringify(planData, null, 2)}\n\`\`\``,
            isAI: true,
            planData,
          },
        ]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        isAI: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (planData?: AIPlanRow[]) => {
    if (!planData || planData.length === 0) {
      toast.showToast({ 
        title: "No plan data", 
        message: "Generate a plan first", 
        type: "info" 
      });
      return;
    }

    try {
      const res = await fetch("/api/plans/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planName: `AI Plan - ${new Date().toLocaleDateString()}`,
          tasks: planData 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || `Server error ${res.status}`);
      }

      toast.showToast({ 
        title: "Plan created!", 
        message: "Your AI-generated plan has been saved.", 
        type: "success" 
      });
      
      setOpen(false);
      setMessages([]);
    } catch (error) {
      toast.showToast({ 
        title: "Error", 
        message: error instanceof Error ? error.message : "Failed to create plan", 
        type: "error" 
      });
    }
  };

  const saveApiKey = () => {
    if (typeof window === "undefined") return;
    
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      toast.showToast({ 
        title: "Error", 
        message: "API key cannot be empty", 
        type: "error" 
      });
      return;
    }

    localStorage.setItem("gemini_api_key", trimmedKey);
    setApiKey(trimmedKey);
    
    toast.showToast({ 
      title: "Saved", 
      message: "API key saved to localStorage", 
      type: "success" 
    });
    
    setMessages([{
      id: Date.now().toString(),
      text: "✅ API key saved. Describe your goal to generate a plan.",
      isAI: true,
    }]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg inline-flex items-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-colors"
        aria-label="Open AI Plan Generator"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="font-medium">AI Assistant</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI Plan Generator</h3>
                <p className="text-sm text-gray-600">Powered by Google Gemini</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm w-48"
                  aria-label="Gemini API key"
                />
                <button 
                  onClick={saveApiKey}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors"
                >
                  Save Key
                </button>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="p-4 h-[400px] overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.isAI ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.isAI
                          ? "bg-gray-100 text-gray-800 rounded-tl-none"
                          : "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {msg.text}
                      </pre>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder={apiKey ? "Describe your goal, timeframe, experience level..." : "Add API key first to use AI"}
                  disabled={!apiKey || loading}
                  aria-label="AI prompt"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSend}
                    disabled={loading || !apiKey || !input.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
                  >
                    {loading ? "..." : "Send"}
                  </button>

                  <button
                    onClick={() => {
                      const lastMessage = messages[messages.length - 1];
                      handleGenerate(lastMessage?.planData);
                    }}
                    disabled={!messages.some(m => m.planData)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}