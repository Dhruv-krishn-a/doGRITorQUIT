// apps/cms/app/(admin)/products/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, createProduct, deleteProduct } from "@domain/cms";

export const metadata: Metadata = {
  title: "Products | CMS Admin",
  description: "Manage subscription plans",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="font-bold mb-4">Create New Plan</h3>
        <form action={async (formData: FormData) => {
          "use server";
          // delegate to domain service
          await createProduct({
            name: String(formData.get("name")),
            key: String(formData.get("key")),
            priceRupees: Number(formData.get("price")),
            description: String(formData.get("description") || null),
          });
        }} className="flex gap-4 items-end flex-wrap">
          {/* ... same form UI ... */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded h-10 mb-1px hover:bg-blue-700">Create</button>
        </form>
        <p className="text-xs text-gray-400 mt-2">* Enter amount in Rupees. We handle the conversion to paise automatically.</p>
      </div>

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
            <p className="text-gray-500 text-sm mb-6 grow">{p.description || "No description provided"}</p>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
              <Link href={`/products/${p.id}`} className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-2 rounded transition-colors">
                Manage Features →
              </Link>
              <form action={async () => {
                "use server";
                await deleteProduct(p.id);
              }}>
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
