// apps/cms/app/(admin)/products/page.tsx
import { cms } from "@domain";
import { createProductAction, deleteProductAction } from "./actions";
import { DeleteWithConfirm } from "@/components/ClientActions"; 
import { Plus, Package } from "lucide-react";

export default async function ProductsPage() {
  const products = await cms.getProducts();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Subscription Plans</h1>
          <p className="text-slate-500 mt-1">Configure your tiers and feature-gate your app.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10">
         <form action={createProductAction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Plan Name</label>
                <input name="name" required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="e.g. Pro" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Unique Key</label>
                <input name="key" required className="w-full border rounded-md px-3 py-2 text-sm font-mono uppercase" placeholder="PRO_YEARLY" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Price (INR)</label>
                <input name="price" type="number" required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="999" />
             </div>
             <button className="bg-slate-900 text-white font-bold px-6 py-2 rounded-md hover:bg-slate-800 h-9.5">
                Create Plan
             </button>
         </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between mb-4">
                <Package className="text-slate-400" />
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono font-bold">{p.key}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
            <div className="text-2xl font-black text-slate-800 my-2">₹{(p.price / 100).toLocaleString()}</div>
            <p className="text-xs text-slate-500 mb-6 flex-1">{p.description || "No description."}</p>
            
            <div className="space-y-2">
                <a href={`/products/${p.id}`} className="block w-full text-center bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-slate-800">
                    Configure Features
                </a>
                {p.key !== 'FREE' && (
                  <DeleteWithConfirm action={deleteProductAction.bind(null, p.id)} className="w-full text-red-500 text-[10px] font-bold py-1" />
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}