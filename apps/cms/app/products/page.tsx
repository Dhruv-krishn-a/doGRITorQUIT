import { prisma } from "@/lib/prisma";
import { createProduct, deleteProduct } from "../actions";
import Link from "next/link";

export default async function ProductsPage() {
  // FIX: Added orderBy to sort plans: Free (0) -> Pro (199) -> Team (499)
  const products = await prisma.product.findMany({
    orderBy: { price: 'asc' } 
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>

      {/* Create Form */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="font-bold mb-4">Create New Plan</h3>
        <form action={createProduct} className="flex gap-4 items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Name</label>
            <input name="name" placeholder="e.g. Gold Plan" className="border p-2 rounded w-64" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Key (Unique)</label>
            <input name="key" placeholder="e.g. GOLD_MONTHLY" className="border p-2 rounded w-48" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Price (in Paise)</label>
            {/* Added helper text to prevent the 1.99 error again */}
            <input name="price" type="number" placeholder="19900 for ₹199" className="border p-2 rounded w-32" required />
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded h-10 mb-[1px] hover:bg-blue-700">Create</button>
        </form>
        <p className="text-xs text-gray-400 mt-2">* Note: 100 paise = ₹1. Enter 19900 for a ₹199 plan.</p>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-6 rounded shadow border relative flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
              <span className={`text-[10px] px-2 py-1 rounded font-mono ${p.key === 'FREE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {p.key}
              </span>
            </div>
            
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ₹{p.price / 100}
              <span className="text-sm font-normal text-gray-500 ml-1">/mo</span>
            </div>
            
            <p className="text-gray-500 text-sm mb-6 flex-grow">{p.description || "No description provided"}</p>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
              <Link 
                href={`/products/${p.id}`} 
                className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-2 rounded transition-colors"
              >
                Manage Features →
              </Link>
              
              <form action={deleteProduct.bind(null, p.id)}>
                <button className="text-red-500 text-sm hover:bg-red-50 px-3 py-2 rounded transition-colors">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}