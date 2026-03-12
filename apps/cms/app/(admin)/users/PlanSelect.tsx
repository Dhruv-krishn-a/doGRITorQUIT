// apps/cms/app/%28admin%29/users/PlanSelect.tsx
"use client";

type Product = {
  id: string;
  name: string;
  key: string;
};

type Props = {
  currentProductId?: string | null;
  products: Product[];
};

export default function PlanSelect({ currentProductId, products }: Props) {
  return (
    <select
      name="productId"
      defaultValue={currentProductId || "manual_free"}
      className="transform-gpu bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest px-3 py-2 cursor-pointer max-w-40 truncate hover:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
      onChange={(e) => e.target.form?.requestSubmit()}
    >
      <option value="manual_free">Free Tier</option>
      <optgroup label="Available Tiers" className="transform-gpu font-bold">
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}