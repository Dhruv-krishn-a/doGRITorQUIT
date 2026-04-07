// apps/web/shared/components/FeatureLockec.tsx
import Link from "next/link";
import { Lock } from "lucide-react";

export function FeatureLocked({ title, description }: { title: string; description?: string }) {
  return (
    <div className="transform-gpu flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-300">
      <div className="transform-gpu bg-amber-50 p-6 rounded-full mb-6 ring-8 ring-amber-50/50">
        <Lock size={48} className="transform-gpu text-amber-500" />
      </div>
      <h2 className="transform-gpu text-2xl font-bold text-slate-900 mb-3">{title} is Locked</h2>
      <p className="transform-gpu text-slate-500 max-w-md mb-8 leading-relaxed">
        {description || "Upgrade your plan to unlock this feature and supercharge your productivity."}
      </p>
      
      <div className="transform-gpu flex gap-4">
        <Link 
          href="/dashboard" 
          className="transform-gpu px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Go Back
        </Link>
        <Link 
          href="/dashboard/subscriptions" 
          className="transform-gpu px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
        >
          View Plans
        </Link>
      </div>
    </div>
  );
}