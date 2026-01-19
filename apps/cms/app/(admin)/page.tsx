import { cms } from "@domain";
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
          value={stats.activePlans} 
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
            <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                  <tr key={orderId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {providerId.length > 8 ? providerId.slice(-8) : providerId}...
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {userEmail}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {productName}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-700 font-medium">
                      ₹{(amount / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                        status === 'paid' || status === 'captured' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {dateString}
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found.
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
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between group hover:shadow-md transition-all">
      <div>
        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]} transition-colors`}>
        <Icon size={24} />
      </div>
    </div>
  );
}