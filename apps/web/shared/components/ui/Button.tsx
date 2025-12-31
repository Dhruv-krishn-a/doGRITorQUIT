//components/ui/Button.tsx
/* eslint-disable react/prop-types */
"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 text-sm rounded-md transition font-medium disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]",
    outline: "border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
