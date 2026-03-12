"use client";

import { useFormStatus } from "react-dom";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSystemFeature } from "../../actions";
import { useRef } from "react";

export function CreateFeatureForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await createSystemFeature(formData);
    if (result && !result.success) {
      toast.error(result.error || "Failed to create feature");
    } else {
      toast.success("Feature created successfully!");
      formRef.current?.reset();
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="transform-gpu space-y-4">
      <div className="transform-gpu space-y-1.5">
          <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unique Key</label>
          <input 
            name="key" 
            placeholder="ACCESS_NEW_MODULE" 
            className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold font-mono text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all uppercase"
            required
          />
      </div>
      <div className="transform-gpu space-y-1.5">
          <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
          <textarea 
            name="description" 
            placeholder="What does this feature unlock?" 
            className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all resize-none"
            rows={2}
            required
          />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="transform-gpu w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-100 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="transform-gpu animate-spin" /> Creating...
        </>
      ) : (
        <>
          <Plus size={16} /> Create Global Feature
        </>
      )}
    </button>
  );
}
