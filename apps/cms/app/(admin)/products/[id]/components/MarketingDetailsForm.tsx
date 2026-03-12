"use client";

import { useFormStatus } from "react-dom";
import { Save, Loader2, ShieldCheck, Database, Clock, Key } from "lucide-react";
import { toast } from "sonner";
import { updateProductDetailsAction } from "../../actions";
import { useRef } from "react";

export function MarketingDetailsForm({ product }: { product: any }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    // Correctly handle checkboxes since they don't send anything if unchecked
    if (!formData.has("offlineEnabled")) formData.append("offlineEnabled", "false");
    if (!formData.has("localDbAllowed")) formData.append("localDbAllowed", "false");

    const result = await updateProductDetailsAction(formData);
    if (result && !result.success) {
      toast.error(result.error || "Failed to update details");
    } else {
      toast.success("Marketing and Offline details updated successfully!");
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="transform-gpu p-8">
      <input type="hidden" name="id" value={product.id} />
      
      <div className="transform-gpu grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Basic Marketing */}
        <div className="transform-gpu space-y-8">
          <div className="transform-gpu flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="transform-gpu text-emerald-500" />
            <h3 className="transform-gpu text-xs font-bold text-slate-900 uppercase tracking-widest">General Settings</h3>
          </div>
          
          <div className="transform-gpu space-y-6">
            <div className="transform-gpu space-y-1.5">
              <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
              <input 
                name="name" 
                defaultValue={String(product.name)} 
                className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all"
                required
              />
            </div>
            <div className="transform-gpu space-y-1.5">
              <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marketing Description</label>
              <textarea 
                name="description" 
                defaultValue={String(product.description || "")} 
                className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all resize-none"
                rows={3}
              />
            </div>
            <div className="transform-gpu space-y-1.5">
              <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
              <input 
                name="price" 
                type="number"
                defaultValue={Number(product.price) / 100} 
                className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all"
                required
              />
            </div>
            <div className="transform-gpu space-y-1.5">
                <div className="transform-gpu flex justify-between items-end mb-1 ml-1">
                <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest">Features List</label>
                <span className="transform-gpu text-[9px] font-bold text-slate-300 uppercase">One per line</span>
                </div>
                <textarea 
                name="featuresList" 
                defaultValue={Array.isArray(product.featuresList) ? (product.featuresList as string[]).join("\n") : ""} 
                className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all resize-none"
                rows={5}
                placeholder="Unlimited Projects&#10;Priority Support"
                />
            </div>
          </div>
        </div>

        {/* Right Column: Offline Config */}
        <div className="transform-gpu space-y-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
          <div className="transform-gpu flex items-center gap-2 mb-2">
            <Database size={18} className="transform-gpu text-blue-500" />
            <h3 className="transform-gpu text-xs font-bold text-slate-900 uppercase tracking-widest">Offline-First Engine</h3>
          </div>

          <div className="transform-gpu space-y-6">
            <div className="transform-gpu flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                <div className="transform-gpu flex items-center gap-3">
                    <div className="transform-gpu w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <div className="transform-gpu text-xs font-bold text-slate-900 uppercase tracking-tight">Offline Mode</div>
                        <div className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest">Allow access without internet</div>
                    </div>
                </div>
                <input 
                    type="checkbox" 
                    name="offlineEnabled" 
                    defaultChecked={!!product.offlineEnabled} 
                    className="transform-gpu w-6 h-6 rounded-lg border-slate-200 text-rose-600 focus:ring-rose-500"
                />
            </div>

            <div className="transform-gpu flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                <div className="transform-gpu flex items-center gap-3">
                    <div className="transform-gpu w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                        <Database size={20} />
                    </div>
                    <div>
                        <div className="transform-gpu text-xs font-bold text-slate-900 uppercase tracking-tight">Local Database</div>
                        <div className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enable SQLite persistence</div>
                    </div>
                </div>
                <input 
                    type="checkbox" 
                    name="localDbAllowed" 
                    defaultChecked={!!product.localDbAllowed} 
                    className="transform-gpu w-6 h-6 rounded-lg border-slate-200 text-rose-600 focus:ring-rose-500"
                />
            </div>

            <div className="transform-gpu space-y-4 pt-2">
                <div className="transform-gpu grid grid-cols-2 gap-4">
                    <div className="transform-gpu space-y-1.5">
                        <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-1">
                           <Clock size={12} /> Max Offline (Hours)
                        </label>
                        <input 
                            name="offlineMaxDuration" 
                            type="number"
                            defaultValue={product.offlineMaxDuration ?? 24} 
                            className="transform-gpu w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-300 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="transform-gpu space-y-1.5">
                        <label className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-1">
                           <Key size={12} /> Token Validity (Hours)
                        </label>
                        <input 
                            name="tokenExpiryDuration" 
                            type="number"
                            defaultValue={product.tokenExpiryDuration ?? 48} 
                            className="transform-gpu w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-300 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
                <p className="transform-gpu text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100/50 p-3 rounded-xl border border-dashed border-slate-200">
                    Max Offline Duration controls how long the app stays usable without any pings. Token Validity controls the total life of the signed lease.
                </p>
            </div>

            <div className="transform-gpu pt-4">
                <SubmitButton />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="transform-gpu w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="transform-gpu animate-spin" /> Syncing Config...
        </>
      ) : (
        <>
          <Save size={16} /> Update Plan Architecture
        </>
      )}
    </button>
  );
}
