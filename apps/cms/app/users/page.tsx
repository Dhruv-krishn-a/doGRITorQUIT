import { prisma } from "@/lib/prisma";
import { resetUserAI, updateUserRole, updateUserTier } from "../actions"; // Import new action
import RoleSelect from "./RoleSelect";
import TierSelect from "./TierSelect"; // Import new component

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-3">User</th>
            <th className="text-left p-3">Tier</th>
            <th className="text-left p-3">AI Usage</th>
            <th className="text-left p-3">Role</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td className="p-3">
                <div className="font-bold">{u.email}</div>
                <div className="text-xs text-gray-400">{u.id}</div>
              </td>
              
              {/* UPDATED TIER COLUMN */}
              <td className="p-3">
                <form action={updateUserTier.bind(null, u.id)}>
                  <TierSelect name="tier" defaultValue={u.tier} />
                </form>
              </td>

              <td className="p-3">
                {u.aiUsageCount} <span className="text-gray-400 text-xs">/ {u.tier === 'FREE' ? '1' : '∞'}</span>
              </td>
              <td className="p-3">
                <form action={updateUserRole.bind(null, u.id)}>
                  <RoleSelect name="role" defaultValue={u.role} />
                </form>
              </td>
              <td className="p-3 flex gap-2">
                <form action={resetUserAI.bind(null, u.id)}>
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-red-600">
                    Reset AI
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}