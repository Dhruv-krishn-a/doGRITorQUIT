// apps/cms/app/(admin)/page.tsx
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const admin = await getAdminUser();
  
  // FIX: Redirect to internal /login, NOT localhost:3000
  if (!admin) redirect("/login");

  const [usersCount, ordersCount, productsCount] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 bg-blue-500 rounded-bl-3xl w-16 h-16"></div>
          <div className="text-slate-500 font-medium mb-1">Total Users</div>
          <div className="text-3xl font-bold text-slate-800">{usersCount}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 bg-green-500 rounded-bl-3xl w-16 h-16"></div>
          <div className="text-slate-500 font-medium mb-1">Total Orders</div>
          <div className="text-3xl font-bold text-slate-800">{ordersCount}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 bg-purple-500 rounded-bl-3xl w-16 h-16"></div>
          <div className="text-slate-500 font-medium mb-1">Active Plans</div>
          <div className="text-3xl font-bold text-slate-800">{productsCount}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent Sales</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.user?.email || "Unknown"}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">₹{order.amount / 100}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'paid' || order.status === 'captured' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}