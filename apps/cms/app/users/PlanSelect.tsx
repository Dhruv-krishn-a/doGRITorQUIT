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
      className="border rounded text-sm p-1 cursor-pointer max-w-[140px] truncate"
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