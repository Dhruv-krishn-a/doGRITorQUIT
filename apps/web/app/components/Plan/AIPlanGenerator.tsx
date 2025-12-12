// apps/web/app/components/Plan/AIPlanGenerator.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

type PlanRow = Record<string, unknown>;
type Msg = { text: string; isAI?: boolean; planData?: PlanRow[] };

export default function AIPlanGenerator() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const toast = useToast();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          text: apiKey
            ? "Hello! Describe your goal and timeframe and I'll generate a plan for you."
            : "Please add your Google Gemini API key (Settings) to use the AI Plan Generator.",
          isAI: true,
        },
      ]);
    }
    // include messages.length to satisfy react-hooks/exhaustive-deps rule
  }, [open, apiKey, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callGemini = async (userMessage: string): Promise<string> => {
    if (!apiKey) throw new Error("No API key provided");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a planning assistant. When ready, output ONLY a JSON array (no extra explanation) like:
[
  { "Day": 1, "Task Title": "Setup", "Subtasks": "Install; Configure", "Priority": "High", "Notes": "", "Expected Hours": 2 }
]
Make sure "Subtasks" are semicolon separated and Expected Hours is numeric.`;

    const prompt = `${systemPrompt}\nUser: ${userMessage}\nAssistant:`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 4000 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message ?? `AI request failed (${res.status})`);
    }

    const data = await res.json().catch(() => null);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text;
  };

  const extractJSON = (text: string): PlanRow[] | null => {
    try {
      const match = text.match(/\[\s*{[\s\S]*}\s*\]/);
      if (match) return JSON.parse(match[0]) as PlanRow[];
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed as PlanRow[];
    } catch {
      return null;
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { text: input }]);
    setInput("");
    setLoading(true);

    try {
      const aiText = await callGemini(input);
      const planData = extractJSON(aiText);

      if (Array.isArray(planData) && planData.length > 0) {
        setMessages((m) => [
          ...m,
          { text: "Plan created — preview below", isAI: true },
          { text: JSON.stringify(planData, null, 2), isAI: true, planData },
        ]);
      } else {
        setMessages((m) => [...m, { text: aiText || "No output from AI", isAI: true }]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setMessages((m) => [...m, { text: `❌ ${message}`, isAI: true }]);
    } finally {
      setLoading(false);
    }
  };

  // CSV/Excel download helper
  const downloadExcelFile = (planData: PlanRow[]) => {
    const headers = ["Day", "Task Title", "Subtasks", "Priority", "Notes", "Expected Hours"];
    const rows = planData.map((r) =>
      headers
        .map((h) => {
          // Fixed: Removed `as any`. `r` is Record<string, unknown>, so string indexing is valid.
          const val = r[h] ?? r[h.replace(/ /g, "")] ?? "";
          const s = String(val ?? "");
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai_plan.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async (planData?: PlanRow[]) => {
    if (!planData || planData.length === 0) {
      toast.showToast({ title: "No plan", message: "Generate a plan first", type: "info" });
      return;
    }

    try {
      const res = await fetch("/api/plans/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: "AI Plan", tasks: planData }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? `Server error ${res.status}`);
      }

      const created = await res.json().catch(() => null);
      toast.showToast({ title: "Plan created", message: (created?.title as string) ?? "AI Plan", type: "success" });
      downloadExcelFile(planData);
      setOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.showToast({ title: "Error", message, type: "error" });
    }
  };

  const saveApiKey = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem("gemini_api_key", apiKey);
    toast.showToast({ title: "Saved", message: "API key saved to localStorage", type: "success" });
    setMessages([{ text: "✅ API key saved. Describe your goal to generate a plan.", isAI: true }]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded inline-flex items-center gap-2"
        aria-label="Open AI Plan Generator"
      >
        <MessageSquare className="w-4 h-4" />
        <span>AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-(--bg-card) w-full max-w-2xl rounded-2xl overflow-hidden border border-(--border-color)">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">AI Plan Generator</h3>
                <p className="text-sm text-(--text-secondary)">Powered by Google Gemini</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                  aria-label="Gemini API key"
                />
                <button onClick={saveApiKey} className="px-2 py-1 border rounded text-sm">
                  Save Key
                </button>
                <button onClick={() => setOpen(false)} className="p-2" aria-label="Close">
                  <X />
                </button>
              </div>
            </div>

            <div className="p-4 h-96 overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={m.isAI ? "text-left" : "text-right"}>
                  <pre
                    className={`inline-block p-3 rounded ${
                      m.isAI
                        ? "bg-(--bg-secondary) text-(--text-primary)"
                        : "bg-linear-to-r from-purple-600 to-blue-600 text-white"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {m.text}
                  </pre>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 p-2 border rounded"
                  rows={2}
                  placeholder={apiKey ? "Describe your goal, timeframe, experience level..." : "Add API key first to use AI"}
                  disabled={!apiKey || loading}
                  aria-label="AI prompt"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSend}
                    disabled={loading || !apiKey}
                    className="px-3 py-2 bg-purple-600 text-white rounded disabled:opacity-60"
                  >
                    {loading ? "..." : "Send"}
                  </button>

                  <button
                    onClick={() => {
                      const last = messages.slice(-1)[0];
                      handleGenerate(last?.planData);
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded"
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