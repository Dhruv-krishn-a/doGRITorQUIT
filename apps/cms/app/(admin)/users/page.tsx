// apps/cms/app/(admin)/users/page.tsx
import React from "react";
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect";
import {
  getUsersWithSubscriptions,
  getProducts,
  assignUserPlan as assignUserPlanSvc,
  resetUserAI as resetUserAISvc,
  updateUserRole as updateUserRoleSvc,
} from "@domain/cms";

export default async function UsersPage() {
  // Fetch users and products via domain services
  const [users, products] = await Promise.all([getUsersWithSubscriptions(50), getProducts()]);

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
          {users.map((u: any) => {
            const activeSub = u.subscriptions?.[0];
            const currentProductId = activeSub?.productId;

            return (
              <tr key={u.id} className="border-b">
                <td className="p-3">
                  <div className="font-bold">{u.email}</div>
                  <div className="text-xs text-gray-400">{u.id}</div>
                </td>

                {/* Plan Selector */}
                <td className="p-3">
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await assignUserPlanSvc(u.id, String(formData.get("productId")));
                    }}
                  >
                    <PlanSelect currentProductId={currentProductId} products={products} />
                  </form>

                  <span className="text-[10px] text-gray-400 uppercase ml-1">({u.tier})</span>
                </td>

                <td className="p-3">
                  {u.aiUsageCount}
                  <span className="text-gray-400 text-xs"> / {u.tier === "FREE" ? "1" : "∞"}</span>
                </td>

                <td className="p-3">
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await updateUserRoleSvc(u.id, String(formData.get("role")));
                    }}
                  >
                    <RoleSelect name="role" defaultValue={u.role} />
                  </form>
                </td>

                <td className="p-3 flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await resetUserAISvc(u.id);
                    }}
                  >
                    <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-red-600">Reset AI</button>
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
