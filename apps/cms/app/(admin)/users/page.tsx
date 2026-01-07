// apps/cms/app/(admin)/users/page.tsx
import React from "react";
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect";
import { cms } from "@domain"; 
import { revalidatePath } from "next/cache";

export default async function UsersPage() {
  const [users, products] = await Promise.all([
    cms.getUsersWithSubscriptions(50), 
    cms.getProducts()
  ]);

  // Define actions here or in a separate file
  async function assignPlan(formData: FormData) {
    "use server";
    await cms.assignUserPlan(String(formData.get("userId")), String(formData.get("productId")));
    revalidatePath("/users");
  }

  async function updateRole(formData: FormData) {
    "use server";
    await cms.updateUserRole(String(formData.get("userId")), String(formData.get("role")));
    revalidatePath("/users");
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      {/* ... Header ... */}
      <table className="w-full">
        {/* ... Head ... */}
        <tbody>
          {users.map((u: any) => { // Suggest creating a type UserWithSub defined in domain
            const activeSub = u.subscriptions?.[0];
            const currentProductId = activeSub?.productId;

            return (
              <tr key={u.id} className="border-b">
                {/* ... User Info ... */}
                <td className="p-3">
                  <form action={assignPlan}>
                    <input type="hidden" name="userId" value={u.id} />
                    <PlanSelect currentProductId={currentProductId} products={products} />
                  </form>
                  <span className="text-[10px] text-gray-400 uppercase ml-1">({u.tier})</span>
                </td>

                <td className="p-3">{/* Usage */}</td>

                <td className="p-3">
                  <form action={updateRole}>
                    <input type="hidden" name="userId" value={u.id} />
                    <RoleSelect name="role" defaultValue={u.role} />
                  </form>
                </td>
                {/* ... Actions ... */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}