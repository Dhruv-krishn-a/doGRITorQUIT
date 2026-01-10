// apps/cms/components/ClientActions.tsx
"use client";

import { useState, useTransition } from "react";
import ConfirmModal from "./ConfirmModal";
import { Trash2 } from "lucide-react"; // Assuming you have lucide-react, or use an SVG

// --- DELETE BUTTON WITH MODAL ---
export function DeleteWithConfirm({ 
  action, 
  className 
}: { 
  action: () => Promise<void>, 
  className?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await action();
      setIsOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className={className}
        type="button"
      >
        {isPending ? "Deleting..." : "Delete Plan"}
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Subscription Plan?"
        description="This action cannot be undone. This plan will be permanently removed from the system."
        confirmText="Delete Plan"
        isDestructive={true}
        isLoading={isPending}
      />
    </>
  );
}

// --- TOGGLE SWITCH WITH MODAL ---
export function ToggleWithConfirm({
  action,
  isEnabled
}: {
  action: () => Promise<void>,
  isEnabled: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // We optimistically toggle the UI while the modal is open if you prefer, 
  // but for safety, we usually wait for confirmation.
  
  const handleConfirm = () => {
    startTransition(async () => {
      await action();
      setIsOpen(false);
    });
  };

  // Only show confirmation when disabling a feature (often more destructive)
  // OR show it for both. Let's do both for safety as requested.
  const handleClick = () => {
    setIsOpen(true);
  };

  const verb = isEnabled ? "disable" : "enable";

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        type="button"
        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isEnabled ? "bg-green-500" : "bg-slate-300"
        } ${isPending ? "opacity-50 cursor-wait" : ""}`}
        aria-pressed={isEnabled}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${
            isEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={`Confirm ${verb} Feature`}
        description={`Are you sure you want to ${verb} this feature? This will immediately affect all users on this plan.`}
        confirmText={isEnabled ? "Disable" : "Enable"}
        isDestructive={isEnabled} // Disabling is usually "destructive"
        isLoading={isPending}
      />
    </>
  );
}