// apps/cms/app/(admin)/products/[id]/page.tsx
import React from "react";
import { getProductDetail, getAllFeatures } from "@domain/cms";
import { saveFeatureValue, toggleFeature, createSystemFeature } from "./actions";

// ... (Imports remain similar, remove inline actions)

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await getProductDetail(id);
  const allFeatures = await getAllFeatures();

  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* ... Header ... */}
      
      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <table className="w-full">
          {/* ... Thead ... */}
          <tbody>
            {allFeatures.map((feature) => {
              const pf = product.productFeatures.find((f) => f.featureId === feature.id);
              const isEnabled = !!pf;
              const isConfigurable = feature.key.endsWith("_LIMIT") || feature.key.endsWith("_DAYS");
              
              // Safe extraction of nested value
              const pfValue = pf?.value as Record<string, any> | null;
              const currentValue = pfValue?.value ?? pfValue?.limit ?? 0;

              return (
                <tr key={feature.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-sm">{feature.key}</td>
                  <td className="p-4 text-sm text-gray-600">{feature.description}</td>

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
                          className="w-20 border rounded p-1 text-center text-sm"
                        />
                        <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                          Save
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>

                  {/* Toggle Column */}
                  <td className="p-4 text-center">
                    <form action={toggleFeature.bind(null, product.id, feature.id, isEnabled)}>
                      <button
                        type="submit"
                        className={`w-12 h-6 rounded-full transition-colors relative ${isEnabled ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            isEnabled ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* ... Footer forms using createSystemFeature action ... */}
    </div>
  );
}