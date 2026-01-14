import { cms } from "@domain"; // Ensure billing is imported if needed, usually cms covers this read
import { assignPlanAction, updateRoleAction } from "./actions";
import { Search, Shield, User as UserIcon } from "lucide-react";
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect";
import LimitManager from "./Limitmanager"; // Import the new component

export const metadata = {
  title: "Users | CMS Admin",
};

export default async function UsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  
  // 1. Fetch Users (Now includes productFeatures thanks to Step 1)
  const users = await cms.getUsersWithSubscriptions(50, query);
  
  // 2. Fetch Products
  const products = await cms.getProducts();
  const productOptions = products.map(p => ({ id: p.id, name: p.name, key: p.key }));

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Manage user roles, plans, and usage limits.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <form>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              name="q" 
              defaultValue={query} 
              placeholder="Search users..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full md:w-72 shadow-sm"
            />
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Profile</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Usage</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const activeSub = user.subscriptions[0];
                const currentProductId = activeSub?.product?.id;

                // --- Calculate Limit Logic ---
                let effectiveLimit = 5; // Default

                if (user.customAiLimit !== null) {
                    // 1. Custom Limit Override
                    effectiveLimit = user.customAiLimit;
                } else if (activeSub?.product && 'productFeatures' in activeSub.product) {
                    // 2. Plan Limit
                    // We cast activeSub.product because Prisma types can be deep/complex here
                    const prod = activeSub.product as any;
                    const limitFeat = prod.productFeatures.find((f: any) => f.feature.key === 'AI_GEN_LIMIT');
                    
                    if (limitFeat) {
                         const val = limitFeat.value;
                         effectiveLimit = val.value ?? val.limit ?? 5;
                    } else if (activeSub.product.key !== 'FREE') {
                        effectiveLimit = 100; // Hard fallback for paid plans if feature is missing
                    }
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : <UserIcon size={20} />}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name || "No Name"}</div>
                          <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <form action={updateRoleAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <RoleSelect defaultValue={user.role} name="role" />
                      </form>
                    </td>

                    <td className="p-4">
                       <form action={assignPlanAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <PlanSelect products={productOptions} currentProductId={currentProductId} />
                       </form>
                    </td>

                    <td className="p-4">
                        <LimitManager 
                            userId={user.id}
                            usage={user.aiUsageCount}
                            currentLimit={effectiveLimit}
                            customLimit={user.customAiLimit}
                        />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'admin' && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded border border-purple-100">
                                Admin
                            </span>
                        )}
                        {activeSub && (
                           <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-100">
                             Active
                           </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}