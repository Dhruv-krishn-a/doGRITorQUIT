import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { SyncEngine } from "./services/sync.engine";
import { initGlobalErrorLogging, logger } from "./lib/logger";
import { QueryProvider } from "./providers/QueryProvider";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Only use Tauri's native fetch for our API domains to bypass Linux CORS/Webkit restrictions
      if (urlStr.includes('dogritorquit.in') || urlStr.includes('staging.gritorquit.in') || urlStr.includes('localhost:3000')) {
         const headers = new Headers(init?.headers);
         // Ensure we have a valid User-Agent so Vercel/Cloudflare don't block the request
         if (!headers.has('User-Agent')) {
           headers.set('User-Agent', window.navigator.userAgent || 'grit-io-desktop');
         }

         const tauriOptions = {
           ...init,
           headers: Object.fromEntries(headers.entries())
         };

         return await tauriFetch(urlStr, tauriOptions);
      }
    } catch (e) {
      console.error("[Fetch Interceptor Error]", e);
    }
    return originalFetch(input, init);
  };
}

initGlobalErrorLogging();
logger.info("app.bootstrap");
SyncEngine.start();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>,
);
