import { prisma } from "@/lib/prisma";
import { toggleProductFeature, createFeature } from "../../actions";

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { id } = await params; // Nextjs 15 requires awaiting params, safe for 14 too

  const product = await prisma.product.findUnique({
    where: { id },
    include: { productFeatures: true }
  });

  const allFeatures = await prisma.feature.findMany();

  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{product.name} <span className="text-gray-400 text-lg">Features</span></h1>
        <p className="text-gray-500">Manage what this plan entitles the user to.</p>
      </div>

      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Feature Key</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-center">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {allFeatures.map(feature => {
              const isEnabled = product.productFeatures.some(pf => pf.featureId === feature.id);
              
              return (
                <tr key={feature.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-sm">{feature.key}</td>
                  <td className="p-4 text-sm text-gray-600">{feature.description}</td>
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

      {/* Add New Global Feature */}
      <div className="bg-gray-100 p-6 rounded border border-gray-200">
        <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">Define New System Feature</h3>
        <form action={createFeature} className="flex gap-4">
          <input name="key" placeholder="Key (e.g. AI_PLAN)" className="border p-2 rounded flex-1" required />
          <input name="description" placeholder="Description" className="border p-2 rounded flex-[2]" required />
          <button className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-900">Add Definition</button>
        </form>
      </div>
    </div>
  );
}