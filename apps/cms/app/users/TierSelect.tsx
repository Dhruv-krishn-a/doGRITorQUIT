"use client";

type Props = {
  defaultValue: string;
  name: string;
};

export default function TierSelect({ defaultValue, name }: Props) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={`border rounded text-sm p-1 cursor-pointer font-medium ${
        defaultValue === 'FREE' ? 'text-gray-600 bg-gray-50' : 
        defaultValue === 'PRO' ? 'text-blue-600 bg-blue-50' : 
        'text-purple-600 bg-purple-50'
      }`}
      onChange={(e) => e.target.form?.requestSubmit()}
    >
      <option value="FREE">FREE</option>
      <option value="PRO">PRO</option>
      <option value="TEAM">TEAM</option>
    </select>
  );
}