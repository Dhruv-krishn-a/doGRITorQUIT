// apps/cms/app/(admin)/products/[id]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cms } from "@domain"; // Import from domain directly
import { 
  updateFeatureValue, 
  toggleProductFeature, 
  removeProductFeature, 
  createSystemFeature // Ensure this is exported from actions
} from "../actions";
import { ChevronLeft, Save, Trash2, Plus, Zap, Lock } from "lucide-react";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = params;
  
  // Use cms.* directly as per your domain structure
  const [product, allFeatures] = await Promise.all([
    cms.getProductDetail(id),
    cms.getAllFeatures(),
  ]);

  if (!product) notFound();

  // Separate features into "Active on Plan" and "Available to Add"
  const activeFeatureIds = new Set(product.productFeatures.map(pf => pf.featureId));
  const availableFeatures = allFeatures.filter(f => !activeFeatureIds.has(f.id));

  // Sort active features: Boolean permissions first, then Numeric limits
  const activeFeatures = product.productFeatures.sort((a, b) => {
    const aIsBool = a.feature.key.startsWith("ACCESS_");
    const bIsBool = b.feature.key.startsWith("ACCESS_");
    if (aIsBool && !bIsBool) return -1;
    if (!aIsBool && bIsBool) return 1;
    return a.feature.key.localeCompare(b.feature.key);
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/products" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Plans
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-slate-500 font-mono text-sm mt-1">{product.key}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              ₹{(product.price / 100).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">per month</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Active Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Active Features & Limits</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {activeFeatures.length} Configured
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {activeFeatures.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p>No features configured for this plan yet.</p>
                  <p className="text-sm mt-1">Add features from the list on the right.</p>
                </div>
              ) : (
                activeFeatures.map((pf) => {
                  const isAccess = pf.feature.key.startsWith("ACCESS_");
                  // Handle different value structures { value: 5 } or { limit: 5 } or just 5
                  const rawVal = pf.value as any;
                  const currentValue = rawVal?.value ?? rawVal?.limit ?? 0;

                  return (
                    <div key={pf.feature.id} className="p-6 flex items-start justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          {isAccess ? (
                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                              <Lock size={14} /> 
                            </div>
                          ) : (
                            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md">
                              <Zap size={14} />
                            </div>
                          )}
                          <span className="font-bold text-slate-700">{pf.feature.key}</span>
                        </div>
                        <p className="text-sm text-slate-500">{pf.feature.description}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* If it's a numeric limit, show input */}
                        {!isAccess && (
                          <form action={updateFeatureValue} className="flex items-center gap-2">
                             <input type="hidden" name="productId" value={product.id} />
                             <input type="hidden" name="featureId" value={pf.featureId} />
                             <div className="relative">
                               <input 
                                 name="value"
                                 type="number" 
                                 defaultValue={currentValue}
                                 className="w-24 pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                               />
                               <button className="absolute right-2 top-2 text-slate-400 hover:text-blue-600">
                                 <Save size={16} />
                               </button>
                             </div>
                          </form>
                        )}

                        {/* If it's an ACCESS feature, just showing it exists means it's Enabled */}
                        {isAccess && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            UNLOCKED
                          </span>
                        )}

                        {/* Remove Button */}
                        <form action={removeProductFeature}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="featureId" value={pf.featureId} />
                          <button 
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove feature from plan"
                          >
                            <Trash2 size={18} />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
           {/* Helper to add system features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold mb-2 text-blue-900 text-sm uppercase">Quick Add System Features</h3>
                <p className="text-sm text-blue-600 mb-4">Add these standard keys if they are missing from your system.</p>
                <div className="flex flex-wrap gap-2">
                    <form action={createSystemFeature} className="inline">
                    <input type="hidden" name="key" value="AI_GEN_LIMIT" />
                    <input type="hidden" name="description" value="Max AI generations allowed per month" />
                    <button className="bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-50 transition-colors">
                        + Add AI_GEN_LIMIT
                    </button>
                    </form>

                    <form action={createSystemFeature} className="inline">
                    <input type="hidden" name="key" value="MAX_PLAN_DAYS" />
                    <input type="hidden" name="description" value="Max days a single plan can cover" />
                    <button className="bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-50 transition-colors">
                        + Add MAX_PLAN_DAYS
                    </button>
                    </form>
                </div>
                </div>

                {/* Manual Add Form */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">Define Custom Feature</h3>
                <form action={createSystemFeature} className="flex flex-col gap-3">
                    <input name="key" placeholder="Key (e.g. FILE_UPLOAD_LIMIT)" className="border border-gray-300 p-2 rounded-md text-sm w-full" required />
                    <div className="flex gap-2">
                    <input name="description" placeholder="Description" className="border border-gray-300 p-2 rounded-md text-sm flex-1" required />
                    <button className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 text-xs font-medium whitespace-nowrap">
                        Add Definition
                    </button>
                    </div>
                </form>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Available Features */}
        <div>
          <div className="bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden sticky top-6">
            <div className="p-6 border-b border-slate-700">
              <h3 className="font-bold">Add Features</h3>
              <p className="text-slate-400 text-xs mt-1">Click to add to this plan</p>
            </div>
            
            <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {availableFeatures.map(f => {
                const isAccess = f.key.startsWith("ACCESS_");
                return (
                  <form key={f.id} action={toggleProductFeature}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="featureId" value={f.id} />
                    
                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors group flex items-center justify-between border border-transparent hover:border-slate-700">
                      <div>
                        <div className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                          {f.key}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-45">
                          {f.description}
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-full ${
                        isAccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        <Plus size={16} />
                      </div>
                    </button>
                  </form>
                );
              })}
              
              {availableFeatures.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  All available features have been added!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}