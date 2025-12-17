import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const admin = await getAdminUser();
  if (!admin) redirect("http://localhost:3000/login");

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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-500">Total Users</div>
          <div className="text-3xl font-bold">{usersCount}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-500">Total Orders</div>
          <div className="text-3xl font-bold">{ordersCount}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-gray-500">Active Plans</div>
          <div className="text-3xl font-bold">{productsCount}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-500">
              <th className="py-2">User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="py-3">{order.user?.email || "Unknown"}</td>
                <td className="font-mono">₹{order.amount / 100}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${order.status === 'paid' || order.status === 'captured' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}