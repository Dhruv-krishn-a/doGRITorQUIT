// apps/cms/app/(admin)/users/page.tsx
import React from "react";
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect";
import { cms } from "@domain"; 
import { revalidatePath } from "next/cache";
import { updateUserLimit } from "./actions";

export default async function UsersPage() {
  const [users, products] = await Promise.all([
    cms.getUsersWithSubscriptions(50), 
    cms.getProducts()
  ]);

  // We need to find the "Free" product definition to fallback to for users without a sub
  const freeProduct = products.find(p => p.key === "FREE");

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
    <div className="bg-white p-6 rounded shadow border border-slate-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500 text-sm">Manage user roles, subscriptions, and override AI limits.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="p-4">User Details</th>
              <th className="p-4">Subscription Plan</th>
              <th className="p-4 text-center">AI Usage / Limit</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u: any) => { 
              const activeSub = u.subscriptions?.[0];
              const currentProductId = activeSub?.productId;
              
              // ✅ 1. Determine Actual Plan Name
              const planName = activeSub?.product?.name || "Free Tier";
              const planKey = activeSub?.product?.key || "FREE";

              // ✅ 2. Resolve Limit (Custom > Active Plan > Free Plan)
              let limit = 0;
              const customLimit = u.customAiLimit;
              const isOverridden = customLimit !== null;

              if (isOverridden) {
                limit = customLimit;
              } else {
                // Get features from active plan OR fallback to Free plan
                // Note: activeSub.product might not have features loaded deep enough depending on query
                // but usually cms.getUsersWithSubscriptions includes it.
                // If not, we fallback to the 'products' list we fetched above.
                
                const productDef = activeSub?.product || freeProduct;
                const features = productDef?.productFeatures || [];
                const limitFeat = features.find((pf: any) => pf.feature.key === "AI_GEN_LIMIT");
                
                if (limitFeat?.value?.value) {
                  limit = limitFeat.value.value;
                }
              }

              const percent = limit > 0 ? Math.min(100, (u.aiUsageCount / limit) * 100) : 0;

              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 align-top">
                    <div className="font-medium text-slate-900">{u.email}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">ID: {u.id.slice(0, 8)}...</div>
                  </td>

                  <td className="p-4 align-top">
                    <form action={assignPlan} className="flex flex-col gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <div className="flex items-center gap-2">
                        <PlanSelect currentProductId={currentProductId} products={products} />
                        
                        {/* Dynamic Badge - Shows Real Plan Name */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border whitespace-nowrap ${
                          planKey === 'FREE' ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {planName}
                        </span>
                      </div>
                    </form>
                  </td>

                  <td className="p-4 align-top">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-baseline gap-1 text-sm">
                        <span className="font-bold text-slate-700">{u.aiUsageCount}</span>
                        <span className="text-slate-400">/</span>
                        <span className={`font-bold ${isOverridden ? 'text-blue-600' : 'text-slate-700'}`}>
                          {limit === 0 && !isOverridden ? "?" : (limit === Infinity ? '∞' : limit)}
                        </span>
                      </div>
                      
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${percent > 90 ? 'bg-red-500' : 'bg-blue-500'} transition-all`} style={{ width: `${percent}%` }} />
                      </div>

                      <form action={updateUserLimit} className="flex items-center gap-1 mt-1">
                        <input type="hidden" name="userId" value={u.id} />
                        <input 
                          name="limit" 
                          type="number" 
                          defaultValue={isOverridden ? customLimit : ""}
                          placeholder="Auto"
                          className={`w-16 text-center text-xs border rounded px-1 py-0.5 focus:border-blue-500 outline-none ${
                            isOverridden ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-300'
                          }`}
                        />
                        <button className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded">Set</button>
                      </form>
                    </div>
                  </td>

                  <td className="p-4 align-top">
                    <form action={updateRole}>
                      <input type="hidden" name="userId" value={u.id} />
                      <RoleSelect name="role" defaultValue={u.role} />
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}