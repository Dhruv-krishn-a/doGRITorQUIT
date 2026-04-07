import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { SyncEngine } from "./services/sync.engine";
import { initGlobalErrorLogging, logger } from "./lib/logger";
import { QueryProvider } from "./providers/QueryProvider";

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
