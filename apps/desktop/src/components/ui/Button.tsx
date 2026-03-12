import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white";
    
    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
      secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm",
      ghost: "hover:bg-slate-100 text-slate-700",
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], "h-10 px-4 py-2", className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="transform-gpu mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
