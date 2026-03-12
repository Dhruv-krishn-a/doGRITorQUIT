import { cms } from "@domain";
import { createProductAction, deleteProductAction } from "./actions";
import { DeleteWithConfirm } from "@/components/ClientActions"; 
import { Plus, Package } from "lucide-react";

import { SubmitButton } from "@/components/ui/SubmitButton";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await cms.getProducts();

  return (
    <div className="transform-gpu max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="transform-gpu flex justify-between items-end mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="transform-gpu text-4xl font-bold text-slate-900 tracking-tight uppercase">Subscription Tiers</h1>
          <p className="transform-gpu text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <span className="transform-gpu w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Commercial Logic & Feature Gating
          </p>
        </div>
      </div>

      <div className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <h3 className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Architect New Tier</h3>
         <form action={createProductAction} className="transform-gpu grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
             <div className="transform-gpu space-y-2">
                <label className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                <input name="name" required className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all shadow-inner" placeholder="e.g. Pro Tier" />
             </div>
             <div className="transform-gpu space-y-2">
                <label className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">System Key</label>
                <input name="key" required className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold font-mono uppercase text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all shadow-inner" placeholder="PRO_YEARLY" />
             </div>
             <div className="transform-gpu space-y-2">
                <label className="transform-gpu text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
                <input name="price" type="number" required className="transform-gpu w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:bg-white focus:border-rose-300 outline-none transition-all shadow-inner" placeholder="999" />
             </div>
             <SubmitButton className="transform-gpu bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-slate-100 active:scale-95" loadingText="Creating..." icon={<Plus size={14} />}>
                Create Tier
             </SubmitButton>
         </form>
      </div>

      <div className="transform-gpu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(p => {
          // ✅ FIX: Strict casting for all dynamic variables
          const pId = String(p.id);
          const pKey = String(p.key ?? "NO_KEY");
          const pName = String(p.name ?? "Untitled Plan");
          const pPrice = Number(p.price ?? 0);
          const pDesc = String(p.description ?? "No marketing description set.");

          return (
            <div key={pId} className="transform-gpu group relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 flex flex-col hover:shadow-xl hover:border-rose-100 transition-all duration-500 hover:-translate-y-1">
              <div className="transform-gpu flex justify-between items-start mb-6">
                  <div className="transform-gpu p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-all duration-500 shadow-sm border border-slate-100">
                    <Package size={20} />
                  </div>
                  <span className="transform-gpu text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-mono font-bold uppercase tracking-tighter border border-slate-200">{pKey}</span>
              </div>
              <h3 className="transform-gpu text-xl font-bold text-slate-900 uppercase tracking-tight">{pName}</h3>
              <div className="transform-gpu text-3xl font-bold text-slate-900 tracking-tighter my-3">₹{(pPrice / 100).toLocaleString()}</div>
              <p className="transform-gpu text-xs font-medium text-slate-500 mb-8 flex-1 leading-relaxed">{pDesc}</p>
              
              <div className="transform-gpu space-y-3 pt-6 border-t border-rose-50">
                  <a href={`/products/${pId}`} className="transform-gpu block w-full text-center bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-rose-600 transition-all shadow-md active:scale-95">
                      Configure Features
                  </a>
                  {pKey.toUpperCase() !== 'FREE' && pKey.toUpperCase() !== 'FREE TIER' && pPrice > 0 ? (
                    <DeleteWithConfirm action={deleteProductAction.bind(null, pId)} label="Terminate Tier" className="transform-gpu w-full text-rose-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest py-2 transition-colors" />
                  ) : (
                    <div className="transform-gpu w-full text-slate-300 text-center text-[9px] font-bold uppercase tracking-widest py-2 italic">
                      System Reserved
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}