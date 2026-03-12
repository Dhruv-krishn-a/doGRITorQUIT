import { cms } from "@domain"; 
import { assignPlanAction, updateRoleAction } from "./actions";
import { Search, Shield, User as UserIcon } from "lucide-react";
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect";
import LimitManager from "./Limitmanager"; 
import { InlineFormWrapper } from "./InlineFormWrapper";
import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Users | CMS Admin",
};

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: { q?: string, page?: string } }) {
  const query = searchParams.q || "";
  const page = Number(searchParams.page || 1);
  const limit = 50;
  const skip = (page - 1) * limit;
  
  // 1. Fetch Users with pagination
  const users = await cms.getUsersWithSubscriptions(limit, skip, query);
  
  // 2. Fetch Products
  const productsRaw = await cms.getProducts();
  
  const productOptions = productsRaw.map(p => ({ 
    id: String(p.id), 
    name: String(p.name ?? "Unknown Plan"), 
    key: String(p.key) 
  }));

  const hasMore = users.length === limit;

  return (
    <div className="transform-gpu max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="transform-gpu flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="transform-gpu text-4xl font-bold text-slate-900 tracking-tight uppercase">User Management</h1>
          <p className="transform-gpu text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <span className="transform-gpu w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Roles, Subscriptions & Limits
          </p>
        </div>
        <div className="transform-gpu relative w-full md:w-auto">
          <form className="transform-gpu group">
            <Search className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              name="q" 
              defaultValue={query} 
              placeholder="SEARCH IDENTITIES..." 
              className="transform-gpu pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 w-full md:w-80 shadow-sm transition-all placeholder:text-slate-300"
            />
          </form>
        </div>
      </div>

      <div className="transform-gpu bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="transform-gpu overflow-x-auto">
          <table className="transform-gpu w-full text-left border-collapse">
            <thead>
              <tr className="transform-gpu text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="transform-gpu px-8 py-4">User Profile</th>
                <th className="transform-gpu px-8 py-4">Role</th>
                <th className="transform-gpu px-8 py-4">Plan</th>
                <th className="transform-gpu px-8 py-4">AI Usage</th>
                <th className="transform-gpu px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="transform-gpu divide-y divide-rose-50/50">
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
                  <tr key={String(user.id)} className="transform-gpu hover:bg-rose-50/30 transition-colors group">
                    <td className="transform-gpu px-8 py-5">
                      <div className="transform-gpu flex items-center gap-4">
                        <div className="transform-gpu w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                          {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="" className="transform-gpu w-full h-full object-cover" />
                          ) : <UserIcon size={24} />}
                        </div>
                        <div>
                          <div className="transform-gpu text-sm font-bold text-slate-900 uppercase tracking-tight">{profile.name || "Identified Entity"}</div>
                          <div className="transform-gpu text-[10px] text-slate-400 font-medium font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="transform-gpu px-8 py-5">
                      <InlineFormWrapper action={updateRoleAction} successMessage="Role updated" errorMessage="Failed to update role">
                          <input type="hidden" name="userId" value={String(user.id)} />
                          <RoleSelect defaultValue={String(user.role)} name="role" />
                      </InlineFormWrapper>
                    </td>

                    <td className="transform-gpu px-8 py-5">
                       <InlineFormWrapper action={assignPlanAction} successMessage="Plan assigned" errorMessage="Failed to assign plan">
                          <input type="hidden" name="userId" value={String(user.id)} />
                          <PlanSelect products={productOptions} currentProductId={currentProductId} />
                       </InlineFormWrapper>
                    </td>

                    <td className="transform-gpu px-8 py-5">
                        <LimitManager 
                            userId={String(user.id)}
                            usage={Number(aiUsage.count)}
                            currentLimit={effectiveLimit}
                            customLimit={user.customAiLimit}
                        />
                    </td>

                    <td className="transform-gpu px-8 py-5 text-right">
                      <div className="transform-gpu flex justify-end gap-2">
                        {user.role === 'admin' && (
                            <span className="transform-gpu px-3 py-1 bg-purple-50 text-purple-600 text-[9px] font-bold uppercase tracking-widest rounded-full border border-purple-100 shadow-sm shadow-purple-50">
                                Admin
                            </span>
                        )}
                        {activeSub && (
                           <span className="transform-gpu px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm shadow-emerald-50">
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
      
      <Pagination currentPage={page} hasMore={hasMore} />
    </div>
  );
}