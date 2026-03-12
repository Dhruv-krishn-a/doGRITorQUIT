// apps/cms/components/ClientActions.tsx
"use client";

import { useState, useTransition } from "react";
import ConfirmModal from "./ConfirmModal";
import { Trash2 } from "lucide-react"; // Assuming you have lucide-react, or use an SVG

// --- DELETE BUTTON WITH MODAL ---
export function DeleteWithConfirm({ 
  action, 
  className,
  label = "Delete Tier"
}: { 
  action: () => Promise<void>, 
  className?: string,
  label?: string
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
        {isPending ? "Terminating..." : label}
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Termination?"
        description="This action cannot be undone. This tier will be permanently removed from the system."
        confirmText="Confirm Delete"
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

  const handleConfirm = () => {
    startTransition(async () => {
      await action();
      setIsOpen(false);
    });
  };

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
        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${
          isEnabled ? "bg-slate-900" : "bg-slate-200"
        } ${isPending ? "opacity-50 cursor-wait" : "active:scale-95"}`}
        aria-pressed={isEnabled}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
            isEnabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={`Confirm Change`}
        description={`Are you sure you want to ${verb} this feature? This will immediately affect all users on this tier.`}
        confirmText={isEnabled ? "Disable" : "Enable"}
        isDestructive={isEnabled} 
        isLoading={isPending}
      />
    </>
  );
}