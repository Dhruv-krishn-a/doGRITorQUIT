// apps/cms/app/(admin)/users/RoleSelect.tsx
"use client";

type Props = {
  defaultValue: string;
  name: string;
};

export default function RoleSelect({ defaultValue, name }: Props) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="border rounded text-sm p-1 cursor-pointer"
      // This interactive event handler is now allowed because of "use client"
      onChange={(e) => e.target.form?.requestSubmit()}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}