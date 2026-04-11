import React from "react";
import { DeveloperHub } from "@gritorquit/dashboard-ui-web";
import { toast } from "sonner";
import { api } from "../services/api";

export default function FeedbackPage() {
  const handleSendFeedback = async (data: { message: string; type: string; platform: string }) => {
    try {
      await api.post("/feedback", data);
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
        platform="desktop" 
        onSendFeedback={handleSendFeedback} 
      />
    </div>
  );
}
