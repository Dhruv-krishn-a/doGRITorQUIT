import { cms } from "@domain"; 
import { assignPlanAction, updateRoleAction } from "./actions";
import { Search, Shield, User as UserIcon } from "lucide-react";
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect";
import LimitManager from "./Limitmanager"; 

export const metadata = {
  title: "Users | CMS Admin",
};

export default async function UsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  
  // 1. Fetch Users
  const users = await cms.getUsersWithSubscriptions(50, query);
  
  // 2. Fetch Products
  const productsRaw = await cms.getProducts();
  
  // ✅ FIX: Strict casting to ensure 'products' prop receives valid strings
  const productOptions = productsRaw.map(p => ({ 
    id: String(p.id), 
    name: String(p.name ?? "Unknown Plan"), 
    key: String(p.key) 
  }));

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
              {users.map((userData) => {
                const user = userData as any; 
                
                const profile = user.profile || {};
                const aiUsage = user.aiUsage || { count: 0 };
                const activeSub = user.subscriptions?.[0];
                const currentProductId = activeSub?.product?.id ? String(activeSub.product.id) : undefined;

                let effectiveLimit = 5; 

                if (user.customAiLimit !== null && user.customAiLimit !== undefined) {
                    effectiveLimit = Number(user.customAiLimit);
                } else if (activeSub?.product && 'productFeatures' in activeSub.product) {
                    const prod = activeSub.product as any;
                    const limitFeat = prod.productFeatures.find((f: any) => f.feature.key === 'AI_GEN_LIMIT');
                    
                    if (limitFeat) {
                         const val = limitFeat.value;
                         effectiveLimit = Number(val.value ?? val.limit ?? 5);
                    } else if (activeSub.product.key !== 'FREE') {
                        effectiveLimit = 100; 
                    }
                }

                return (
                  <tr key={String(user.id)} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
                          {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : <UserIcon size={20} />}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{profile.name || "No Name"}</div>
                          <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <form action={updateRoleAction}>
                          <input type="hidden" name="userId" value={String(user.id)} />
                          <RoleSelect defaultValue={String(user.role)} name="role" />
                      </form>
                    </td>

                    <td className="p-4">
                       <form action={assignPlanAction}>
                          <input type="hidden" name="userId" value={String(user.id)} />
                          <PlanSelect products={productOptions} currentProductId={currentProductId} />
                       </form>
                    </td>

                    <td className="p-4">
                        <LimitManager 
                            userId={String(user.id)}
                            usage={Number(aiUsage.count)}
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