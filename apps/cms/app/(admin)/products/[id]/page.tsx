// apps/cms/app/(admin)/products/[id]/page.tsx
import React from "react";
import { getProductDetail, getAllFeatures } from "@domain/cms";
import { saveFeatureValue, toggleFeature, createSystemFeature } from "./actions";
import { ToggleWithConfirm } from "@/components/ClientActions"; // Import the client component

type Props = { params: { id: string } };

export default async function ProductDetail({ params }: Props) {
  const { id } = params;
  const product = await getProductDetail(id);
  const allFeatures = await getAllFeatures();

  if (!product) return <div className="p-8 text-red-500">Product not found</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {product.name}
        </h1>
        <p className="text-slate-500 mt-2">
          Configure limits (AI count, Days) or toggle specific capabilities for this tier.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Feature Key</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Limit / Value</th>
              <th className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allFeatures.map((feature) => {
              const pf = product.productFeatures.find((f) => f.featureId === feature.id);
              const isEnabled = !!pf;
              const isConfigurable = feature.key.endsWith("_LIMIT") || feature.key.endsWith("_DAYS");
              
              const pfValue = pf?.value as Record<string, any> | null;
              const currentValue = pfValue?.value ?? pfValue?.limit ?? 0;

              return (
                <tr key={feature.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-medium text-sm text-slate-700">{feature.key}</td>
                  <td className="p-4 text-sm text-slate-600">{feature.description}</td>

                  {/* Configuration Column */}
                  <td className="p-4 text-center">
                    {isEnabled && isConfigurable ? (
                      <form action={saveFeatureValue} className="flex items-center justify-center gap-2">
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="featureId" value={feature.id} />
                        <input
                          name="value"
                          type="number"
                          defaultValue={currentValue}
                          className="w-24 border border-slate-300 rounded-md p-1.5 text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors">
                          Save
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">-</span>
                    )}
                  </td>

                  {/* Toggle Column - FIX: Now using the Client Component for confirmation */}
                  <td className="p-4 text-center flex justify-center">
                    <ToggleWithConfirm 
                      isEnabled={isEnabled}
                      action={toggleFeature.bind(null, product.id, feature.id, isEnabled)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Helper to add system features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  );
}