"use client";

import { useEffect } from "react";

export function NotificationManager() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "Notification" in window) {
      // 1. Register Service Worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });

      // 2. Request Permissions if not granted
      if (Notification.permission === "default") {
        setTimeout(() => {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              console.log("Notification permission granted.");
            }
          });
        }, 5000); // Wait 5 seconds after load to not overwhelm the user
      }
    }
  }, []);

  return null;
}
