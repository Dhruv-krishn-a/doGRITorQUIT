import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cms } from "@domain";
import { 
  updateFeatureValue, 
  toggleProductFeature, 
  removeProductFeature, 
  createSystemFeature 
} from "../actions";
import { 
  ChevronLeft, Save, Trash2, Plus, 
  Zap, Lock, Gauge, CheckCircle2 
} from "lucide-react";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = params;
  const [product, allFeatures] = await Promise.all([
    cms.getProductDetail(id),
    cms.getAllFeatures(),
  ]);

  if (!product) notFound();

  // ✅ FIX: Safe ID handling for Sets
  const activeFeatureIds = new Set(product.productFeatures.map(pf => String(pf.featureId)));
  const availableFeatures = allFeatures.filter(f => !activeFeatureIds.has(String(f.id)));

  // ✅ FIX: Robust Sort Logic (Handle null keys safely)
  const sortedFeatures = product.productFeatures.sort((a, b) => {
    const keyA = String(a.feature.key ?? "");
    const keyB = String(b.feature.key ?? "");
    
    const aIsAccess = keyA.startsWith("ACCESS_");
    const bIsAccess = keyB.startsWith("ACCESS_");
    
    if (aIsAccess === bIsAccess) return keyA.localeCompare(keyB);
    return aIsAccess ? -1 : 1;
  });

  // ✅ FIX: Safe Product Variables
  const productName = String(product.name ?? "Untitled Plan");
  const productKey = String(product.key ?? "NO_KEY");
  const productDesc = String(product.description ?? "Plan configuration.");
  const productPrice = Number(product.price ?? 0);
  const productId = String(product.id);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-8">
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Back to Plans
        </Link>
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{productName}</h1>
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-xs font-mono font-bold border border-slate-200">
                {productKey}
              </span>
            </div>
            <p className="text-slate-500 mt-2 max-w-xl">{productDesc}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{(productPrice / 100).toLocaleString()}
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Monthly</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: Active Config */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Plan Configuration</h3>
              <span className="text-xs font-medium text-slate-500">{sortedFeatures.length} active</span>
            </div>

            <div className="divide-y divide-slate-100">
              {sortedFeatures.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic">No features configured.</div>
              ) : (
                sortedFeatures.map((pf) => {
                  // ✅ FIX: Safe Feature Access
                  const featureKey = String(pf.feature.key ?? "");
                  const featureDesc = String(pf.feature.description ?? "");
                  const featureId = String(pf.feature.id);
                  const isAccess = featureKey.startsWith("ACCESS_");
                  
                  const rawVal = pf.value as any;
                  const currentValue = Number(rawVal?.value ?? rawVal?.limit ?? 0);

                  return (
                    <div key={featureId} className="p-5 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl mt-0.5 shadow-sm border ${
                          isAccess ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {isAccess ? <Lock size={18} /> : <Gauge size={18} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{featureKey}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{featureDesc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {!isAccess ? (
                          <form action={updateFeatureValue} className="flex items-center gap-2">
                             <input type="hidden" name="productId" value={productId} />
                             <input type="hidden" name="featureId" value={featureId} />
                             <div className="relative flex items-center">
                               <input 
                                 name="value" 
                                 type="number" 
                                 defaultValue={currentValue} 
                                 className="w-24 pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" 
                               />
                               <button className="absolute right-2 text-slate-300 hover:text-blue-600"><Save size={16} /></button>
                             </div>
                          </form>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                            <CheckCircle2 size={12} /> Unlocked
                          </span>
                        )}
                        <form action={removeProductFeature}>
                          <input type="hidden" name="productId" value={productId} />
                          <input type="hidden" name="featureId" value={featureId} />
                          <button className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </form>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recommended Keys</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "AI_GEN_LIMIT", desc: "Monthly AI credits" },
                { key: "ACCESS_TASKS", desc: "Unlock Tasks Page" },
                { key: "ACCESS_ANALYTICS", desc: "Unlock Analytics" },
              ].map(f => (
                <form key={f.key} action={createSystemFeature}>
                  <input type="hidden" name="key" value={f.key} />
                  <input type="hidden" name="description" value={f.desc} />
                  <button className="bg-white border border-slate-200 shadow-sm text-slate-600 px-3 py-2 rounded-lg text-xs font-bold hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2">
                    <Plus size={14} /> {f.key}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-slate-300 rounded-2xl shadow-xl overflow-hidden sticky top-6">
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" /> Available Features
              </h3>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-mono">{availableFeatures.length}</span>
            </div>
            <div className="p-3 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {availableFeatures.map(f => {
                // ✅ FIX: Safe access for sidebar items
                const fKey = String(f.key ?? "UNKNOWN");
                const fDesc = String(f.description ?? "");
                const fId = String(f.id);
                
                return (
                  <form key={fId} action={toggleProductFeature}>
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="featureId" value={fId} />
                    <button className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${fKey.startsWith("ACCESS_") ? 'text-emerald-400' : 'text-blue-400'}`}>{fKey}</span>
                        <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight truncate">{fDesc}</div>
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}