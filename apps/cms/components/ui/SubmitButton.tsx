"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
  icon?: React.ReactNode;
}

export function SubmitButton({ children, loadingText = "Saving...", icon, className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`relative inline-flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}