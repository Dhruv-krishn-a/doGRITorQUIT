import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true },
    take: 100
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">User</th>
              <th className="p-3">Product</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-gray-500">{order.providerOrderId || order.id}</td>
                <td className="p-3">{order.user?.email}</td>
                <td className="p-3 font-medium">{order.product?.name || "Unknown"}</td>
                <td className="p-3">₹{order.amount / 100}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}