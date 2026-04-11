import { invoke } from "@tauri-apps/api/core";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const NotificationService = {
  async send(title: string, body: string) {
    if (isTauri) {
      try {
        await invoke("notify", { title, body });
      } catch (err) {
        console.error("Native notification failed:", err);
      }
    } else {
      // Fallback to browser notifications
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    }
  },

  async requestPermission() {
    if (!isTauri && "Notification" in window) {
      return await Notification.requestPermission();
    }
    return "granted"; // Tauri handles permissions differently or they are assumed
  }
};
