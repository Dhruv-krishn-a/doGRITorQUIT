import { APP_ENV } from "../config/env";
import { invoke } from "@tauri-apps/api/core";

type LogLevel = "debug" | "info" | "warn" | "error";

function emit(level: LogLevel, event: string, meta?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    app: "gritorquit-desktop",
    env: APP_ENV,
    level,
    event,
    ...(meta ? { meta } : {}),
  };

  const serialized = JSON.stringify(payload);
  
  if (level === "error") {
    console.error(serialized);
    
    // Notify native side for persistent logging or OS alerts
    const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    
    // Refinement: Do not trigger native notifications for standard background/network flickers
    // to avoid "notification spam" while the app is doing background sync.
    const isUserFacingError = !event.includes("window.") && !event.includes("SyncEngine") && !event.includes("useSyncStatus");

    if (isTauri && APP_ENV === 'production' && isUserFacingError) {
      invoke("notify", { 
        title: "System Alert", 
        body: event 
      }).catch(() => {});
    }
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  if (level === "debug") {
    console.debug(serialized);
    return;
  }

  console.log(serialized);
}

export const logger = {
  debug: (event: string, meta?: Record<string, unknown>) => emit("debug", event, meta),
  info: (event: string, meta?: Record<string, unknown>) => emit("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => emit("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => emit("error", event, meta),
};

export function initGlobalErrorLogging() {
  window.addEventListener("error", (event) => {
    logger.error("window.error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { message?: string } | undefined;
    logger.error("window.unhandledrejection", {
      message: reason?.message || String(event.reason),
    });
  });
}
