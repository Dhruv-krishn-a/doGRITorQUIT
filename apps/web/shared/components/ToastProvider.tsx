//components/ToastProvider.tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Toast = {
  id: string;
  title?: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // ms
};

type ToastContextValue = {
  showToast: (t: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = {
      id,
      title: t.title,
      message: t.message,
      type: t.type ?? "info",
      duration: t.duration ?? 4000,
    };
    setToasts((s) => [toast, ...s]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== t.id));
      }, t.duration)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`max-w-sm w-full shadow-lg border rounded-md p-3
              ${t.type === "success" ? "bg-green-50 border-green-200" : ""}
              ${t.type === "error" ? "bg-red-50 border-red-200" : ""}
              ${t.type === "info" ? "bg-white border-slate-200" : ""}`}
          >
            {t.title && <div className="font-semibold text-sm mb-1">{t.title}</div>}
            <div className="text-sm text-slate-800">{t.message}</div>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => dismissToast(t.id)}
                className="text-xs text-slate-500 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
