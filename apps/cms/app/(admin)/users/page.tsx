// apps/cms/app/(admin)/users/page.tsx
import { prisma } from "@/lib/prisma";
import { resetUserAI, updateUserRole, assignUserPlan } from "../../actions"; // Import assignUserPlan
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect"; // Import new component

export default async function UsersPage() {
  // 1. Fetch Users AND Products
  const [users, products] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        // Get active subscription to show current state
        subscriptions: {
          where: { status: "active" },
          take: 1,
          include: { product: true }
        }
      }
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { price: "asc" }
    })
  ]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-3">User</th>
            <th className="text-left p-3">Current Plan</th>
            <th className="text-left p-3">AI Usage</th>
            <th className="text-left p-3">Role</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            // Determine active product ID
            const activeSub = u.subscriptions[0];
            const currentProductId = activeSub?.productId;

            return (
              <tr key={u.id} className="border-b">
                <td className="p-3">
                  <div className="font-bold">{u.email}</div>
                  <div className="text-xs text-gray-400">{u.id}</div>
                </td>
                
                {/* NEW: Real Plan Selector */}
                <td className="p-3">
                  <form action={assignUserPlan.bind(null, u.id)}>
                    <PlanSelect 
                      currentProductId={currentProductId} 
                      products={products} 
                    />
                  </form>
                  {/* Show legacy tier badge below for debugging/verification */}
                  <span className="text-[10px] text-gray-400 uppercase ml-1">
                    ({u.tier})
                  </span>
                </td>

                <td className="p-3">
                  {u.aiUsageCount} 
                  <span className="text-gray-400 text-xs"> / {u.tier === 'FREE' ? '1' : '∞'}</span>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}