// apps/cms/app/%28admin%29/users/RoleSelect.tsx
"use client";

import { useRouter } from "next/navigation";

type Props = {
  defaultValue: string;
  name: string;
};

export default function RoleSelect({ defaultValue, name }: Props) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest px-3 py-2 cursor-pointer hover:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
      onChange={(e) => e.target.form?.requestSubmit()}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}