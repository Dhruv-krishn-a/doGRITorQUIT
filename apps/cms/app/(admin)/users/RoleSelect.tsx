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
      className="border border-slate-300 rounded text-sm px-2 py-1 cursor-pointer bg-white hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      onChange={(e) => e.target.form?.requestSubmit()}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}