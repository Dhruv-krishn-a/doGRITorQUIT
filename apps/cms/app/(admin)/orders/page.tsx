import { cms } from "@domain";
import type { Metadata } from "next";

// ✅ CRITICAL FIX: Forces this page to be dynamic.
// This prevents the "PrismaClientInitializationError" during Vercel build
// by stopping Next.js from trying to fetch database rows during the build process.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders | CMS Admin",
  description: "View payment and order history",
};

export default async function OrdersPage() {
  const orders = await cms.getOrders(100);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Transaction History</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Order ID</th>
                <th className="p-4 font-semibold text-slate-600">User</th>
                <th className="p-4 font-semibold text-slate-600">Product</th>
                <th className="p-4 font-semibold text-slate-600">Amount</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => {
                // ✅ Fix 1: Ensure safe values for rendering
                const orderId = String(order.id);
                const providerOrderId = order.providerOrderId ? String(order.providerOrderId) : orderId;
                const userEmail = order.user?.email ? String(order.user.email) : "No Email";
                const productName = order.product?.name ? String(order.product.name) : "Unknown";
                
                // ✅ Fix 2: Handle numeric math safely
                const amount = Number(order.amount ?? 0); 
                const status = String(order.status);
                
                // ✅ Fix 3: Handle Date safely
                const dateString = order.createdAt ? new Date(order.createdAt as any).toLocaleString() : "N/A";

                return (
                  <tr key={orderId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500">
                      {providerOrderId}
                    </td>
                    <td className="p-4 font-medium text-slate-900">{userEmail}</td>
                    <td className="p-4 text-slate-600">{productName}</td>
                    <td className="p-4 font-mono font-medium">
                      ₹{(amount / 100).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                        status === 'paid' || status === 'captured' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {dateString}
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