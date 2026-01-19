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
      className="border border-slate-300 rounded text-sm px-2 py-1 cursor-pointer bg-white max-w-35 truncate hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      onChange={(e) => e.target.form?.requestSubmit()}
    >
      <option value="manual_free">No Active Plan</option>
      <optgroup label="Available Plans">
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}