import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@domain/cms";
import { createProductAction, deleteProductAction } from "./actions";
import { DeleteWithConfirm } from "@/components/ClientActions"; 

export const metadata: Metadata = {
  title: "Products | CMS Admin",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Subscription Plans</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10">
         <h3 className="font-bold text-lg mb-4 text-slate-700">Create New Plan</h3>
         <form action={createProductAction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Plan Name</label>
                <input name="name" required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="e.g. Pro Monthly" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Key</label>
                <input name="key" required className="w-full border rounded-md px-3 py-2 text-sm font-mono uppercase" placeholder="PRO_MONTHLY" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Price</label>
                <input name="price" type="number" required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="499" />
             </div>
             <button className="bg-slate-900 text-white font-medium px-6 py-2 rounded-md hover:bg-slate-800 h-10">Create</button>
         </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className={`rounded-xl shadow-sm border flex flex-col relative overflow-hidden group ${
            p.key === 'FREE' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
          }`}>
            
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                <span className={`text-[10px] px-2 py-1 rounded border font-mono uppercase ${
                  p.key === 'FREE' ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-white text-slate-500'
                }`}>
                  {p.key}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">₹{(p.price / 100).toLocaleString()}</span>
                <span className="text-sm text-slate-500">/mo</span>
              </div>
            </div>

            <div className="p-6 grow flex flex-col">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {p.description || "No description provided."}
              </p>
              
              <div className="mt-auto space-y-3">
                <Link 
                  href={`/products/${p.id}`} 
                  className="block w-full text-center bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage Features & Limits
                </Link>
                
                {/* Prevent Deleting the Free Tier as it breaks system defaults */}
                {p.key !== 'FREE' ? (
                  <DeleteWithConfirm 
                    action={deleteProductAction.bind(null, p.id)} 
                    className="w-full text-center text-red-500 text-xs hover:text-red-600 hover:underline py-1 transition-colors"
                  />
                ) : (
                  <div className="text-center text-[10px] text-slate-400 py-1 italic">
                    System Default (Cannot Delete)
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}