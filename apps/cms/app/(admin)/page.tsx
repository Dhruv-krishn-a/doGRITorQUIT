import { cms } from "@gritorquit/domain";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, ShoppingBag, CreditCard, TrendingUp, 
  ArrowRight
} from "lucide-react";

export const metadata = {
  title: "Dashboard | CMS Admin",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  const [stats, recentOrders] = await Promise.all([
    cms.getDashboardCounts(),
    cms.getRecentSales(),
  ]);

  const displayName = (admin as any).profile?.name || admin.email || "Admin";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, {displayName}. Here is what's happening today.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Total Users" 
          value={stats.users} 
          icon={Users} 
          color="blue"
        />
        <KpiCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={ShoppingBag} 
          color="purple"
        />
        <KpiCard 
          title="Active Subs" 
          value={stats.activeSubscriptions} 
          icon={CreditCard} 
          color="emerald"
        />
        <KpiCard 
          title="Total Revenue" 
          value={`₹${(stats.totalRevenue / 100).toLocaleString()}`} 
          icon={TrendingUp} 
          color="amber"
        />
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="px-8 py-6 border-b border-rose-100/50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-rose-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Recent Transactions</h2>
            </div>
            <Link href="/orders" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-rose-500 hover:border-rose-200 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 group">
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50/50">
              {recentOrders.map(order => {
                // ✅ FIX: Strict casting for strict TS mode
                const orderId = String(order.id);
                const providerId = order.providerOrderId ? String(order.providerOrderId) : orderId;
                const userEmail = order.user?.email ? String(order.user.email) : "Unknown User";
                const productName = order.product?.name ? String(order.product.name) : "Deleted Plan";
                const amount = Number(order.amount ?? 0);
                const status = String(order.status);
                
                // Safe date handling
                const dateString = order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : "N/A";

                return (
                  <tr key={orderId} className="hover:bg-rose-50/30 transition-colors group">
                    <td className="px-8 py-5 text-[10px] font-bold font-mono text-slate-400">
                      #{providerId.length > 8 ? providerId.slice(-8) : providerId}
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-800 uppercase tracking-tight">{userEmail.split('@')[0]}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{userEmail}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-slate-200">
                        {productName}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-900 tracking-tighter">
                      ₹{(amount / 100).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        status === 'paid' || status === 'captured' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {dateString}
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <ShoppingBag size={32} />
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper Component for consistency
function KpiCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-100",
    purple: "from-purple-500/10 to-fuchsia-500/10 text-purple-600 border-purple-100",
    emerald: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100",
    amber: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-100",
  };

  const iconColors: any = {
    blue: "bg-blue-500 text-white shadow-blue-200",
    purple: "bg-purple-500 text-white shadow-purple-200",
    emerald: "bg-emerald-500 text-white shadow-emerald-200",
    amber: "bg-amber-500 text-white shadow-amber-200",
  };

  return (
    <div className={`relative overflow-hidden bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}>
      <div className={`absolute inset-0 bg-linear-to-br ${colors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</div>
          <div className="text-3xl font-bold text-slate-900 tracking-tighter">{value}</div>
        </div>
        <div className={`p-3.5 rounded-2xl ${iconColors[color]} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}