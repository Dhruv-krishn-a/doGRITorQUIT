import { cms } from "@domain";
import { assignPlanAction, updateRoleAction } from "./actions";
import { Search, Shield, User as UserIcon, Calendar } from "lucide-react";
import RoleSelect from "./RoleSelect";
import PlanSelect from "./PlanSelect";

export const metadata = {
  title: "Users | CMS Admin",
};

export default async function UsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  
  // Fetch data in parallel
  const [users, products] = await Promise.all([
    cms.getUsersWithSubscriptions(50, query),
    cms.getProducts()
  ]);

  // Simplify products for the select dropdown
  const productOptions = products.map(p => ({ id: p.id, name: p.name, key: p.key }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Manage user roles and manually assign subscription plans.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-auto">
          <form>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              name="q"
              placeholder="Search users by name or email..." 
              defaultValue={query}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full md:w-72 shadow-sm"
            />
          </form>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Profile</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Access</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscription Plan</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const activeSub = user.subscriptions[0];
                const currentProductId = activeSub?.product?.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name || "No Name"}</div>
                          <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Role Selection */}
                    <td className="p-4">
                      <form action={updateRoleAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <RoleSelect defaultValue={user.role} name="role" />
                      </form>
                    </td>

                    {/* Plan Selection */}
                    <td className="p-4">
                       <form action={assignPlanAction} className="flex flex-col gap-1">
                          <input type="hidden" name="userId" value={user.id} />
                          <PlanSelect 
                              products={productOptions} 
                              currentProductId={currentProductId} 
                          />
                       </form>
                       {activeSub && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                              <Calendar size={10} />
                              <span>Expires: {activeSub.currentPeriodEnd ? new Date(activeSub.currentPeriodEnd).toLocaleDateString() : 'Never'}</span>
                          </div>
                       )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status Badges */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'admin' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded border border-purple-100">
                                <Shield size={10} /> Super Admin
                            </span>
                        )}
                        {activeSub && (
                           <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-100">
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

        {users.length === 0 && (
            <div className="p-12 text-center text-slate-400">
                No users found matching your search.
            </div>
        )}
      </div>
    </div>
  );
}