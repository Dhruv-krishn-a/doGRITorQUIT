// apps/cms/app/(admin)/products/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { toggleProductFeature, updateFeatureValue, createFeature } from "../../../actions"; // Import updateFeatureValue

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { productFeatures: { include: { feature: true } } }
  });

  const allFeatures = await prisma.feature.findMany();

  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{product.name} <span className="text-gray-400 text-lg">Features</span></h1>
        <p className="text-gray-500">Configure limits (AI count, Days) or toggle capabilities.</p>
      </div>

      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Feature Key</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-center">Configuration</th>
              <th className="p-4 text-center">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {allFeatures.map(feature => {
              const pf = product.productFeatures.find(f => f.featureId === feature.id);
              const isEnabled = !!pf;
              // Check if this feature stores a limit (convention: ends with _LIMIT or _DAYS)
              const isConfigurable = feature.key.endsWith("_LIMIT") || feature.key.endsWith("_DAYS");
              // Extract current value safely
              const currentValue = (pf?.value as any)?.value ?? (pf?.value as any)?.limit ?? 0;

              return (
                <tr key={feature.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-sm">{feature.key}</td>
                  <td className="p-4 text-sm text-gray-600">{feature.description}</td>
                  
                  {/* Configuration Column */}
                  <td className="p-4 text-center">
                    {isEnabled && isConfigurable ? (
                      <form action={updateFeatureValue.bind(null, product.id, feature.id)} className="flex items-center justify-center gap-2">
                        <input 
                          name="value" 
                          type="number" 
                          defaultValue={currentValue}
                          className="w-20 border rounded p-1 text-center text-sm"
                        />
                        <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Save</button>
                      </form>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>

                  {/* Toggle Column */}
                  <td className="p-4 text-center">
                    <form action={async () => {
                      "use server";
                      await toggleProductFeature(product.id, feature.id, !isEnabled);
                    }}>
                      <button 
                        className={`w-12 h-6 rounded-full transition-colors relative ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Helper to add the specific features we need */}
      <div className="bg-blue-50 p-6 rounded border border-blue-200 mb-6">
        <h3 className="font-bold mb-2 text-blue-800">Required System Features</h3>
        <p className="text-sm text-blue-600 mb-4">Ensure these keys exist to control limits:</p>
        <div className="flex gap-2">
            <form action={createFeature} className="inline">
                <input type="hidden" name="key" value="AI_GEN_LIMIT" />
                <input type="hidden" name="description" value="Max AI generations allowed per month" />
                <button className="bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100">
                    + Add AI_GEN_LIMIT
                </button>
            </form>
            <form action={createFeature} className="inline">
                <input type="hidden" name="key" value="MAX_PLAN_DAYS" />
                <input type="hidden" name="description" value="Max days a single plan can cover" />
                <button className="bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100">
                    + Add MAX_PLAN_DAYS
                </button>
            </form>
        </div>
      </div>

      {/* Manual Add Form (Existing) */}
      <div className="bg-gray-100 p-6 rounded border border-gray-200">
        <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">Define New System Feature</h3>
        <form action={createFeature} className="flex gap-4">
          <input name="key" placeholder="Key (e.g. AI_GEN_LIMIT)" className="border p-2 rounded flex-1" required />
          <input name="description" placeholder="Description" className="border p-2 rounded flex-[2]" required />
          <button className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-900">Add Definition</button>
        </form>
      </div>
    </div>
  );
}