"use client";

import React from "react";
import { DeveloperHub } from "@gritorquit/dashboard-ui-web";
import { toast } from "sonner";

export default function FeedbackPage() {
  const handleSendFeedback = async (data: { message: string; type: string; platform: string }) => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to transmit signal");
      }

      toast.success("Feedback transmitted to the developer");
    } catch (err) {
      console.error(err);
      toast.error("Transmission failed. Please try again or use direct Gmail.");
      throw err;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-primary)]">
      <DeveloperHub 
        platform="web" 
        onSendFeedback={handleSendFeedback} 
      />
    </div>
  );
}
