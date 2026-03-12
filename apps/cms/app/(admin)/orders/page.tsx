import { cms } from "@domain";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShoppingBag, Search, Filter } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Orders | CMS Admin",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string, page?: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  const page = Number(searchParams.page || 1);
  const limit = 50;
  const skip = (page - 1) * limit;
  const query = searchParams.q || "";

  const orders = await cms.getOrders(limit, skip);
  const hasMore = orders.length === limit;

  return (
    <div className="transform-gpu max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="transform-gpu flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="transform-gpu text-4xl font-bold text-slate-900 tracking-tight uppercase">Transactions</h1>
          <p className="transform-gpu text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <span className="transform-gpu w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Order History & Financial Records
          </p>
        </div>
        <div className="transform-gpu relative w-full md:w-auto">
          <form className="transform-gpu group">
            <Search className="transform-gpu absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              name="q" 
              defaultValue={query} 
              placeholder="SEARCH ORDERS..." 
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
                <th className="transform-gpu px-8 py-4">Transaction ID</th>
                <th className="transform-gpu px-8 py-4">Customer</th>
                <th className="transform-gpu px-8 py-4">Plan Type</th>
                <th className="transform-gpu px-8 py-4">Amount</th>
                <th className="transform-gpu px-8 py-4">Status</th>
                <th className="transform-gpu px-8 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="transform-gpu divide-y divide-rose-50/50">
              {orders.map((order) => {
                const orderId = String(order.id);
                const providerId = order.providerOrderId ? String(order.providerOrderId) : orderId;
                const userEmail = order.user?.email ? String(order.user.email) : "Unknown User";
                const productName = order.product?.name ? String(order.product.name) : "Deleted Plan";
                const amount = Number(order.amount ?? 0);
                const status = String(order.status);
                const dateString = order.createdAt ? new Date(order.createdAt as any).toLocaleString() : "N/A";

                return (
                  <tr key={orderId} className="transform-gpu hover:bg-rose-50/30 transition-colors group">
                    <td className="transform-gpu px-8 py-5">
                      <div className="transform-gpu text-[10px] font-bold font-mono text-slate-400 mb-1">#{providerId}</div>
                      <div className="transform-gpu text-[9px] text-slate-300 font-medium">Internal: {orderId}</div>
                    </td>
                    <td className="transform-gpu px-8 py-5">
                      <div className="transform-gpu text-sm font-bold text-slate-800 uppercase tracking-tight">{userEmail.split('@')[0]}</div>
                      <div className="transform-gpu text-[10px] text-slate-400 font-medium">{userEmail}</div>
                    </td>
                    <td className="transform-gpu px-8 py-5">
                      <span className="transform-gpu px-2.5 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-slate-200">
                        {productName}
                      </span>
                    </td>
                    <td className="transform-gpu px-8 py-5 text-sm font-bold text-slate-900 tracking-tighter">
                      ₹{(amount / 100).toLocaleString()}
                    </td>
                    <td className="transform-gpu px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        status === 'paid' || status === 'captured' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="transform-gpu px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      {dateString.split(',')[0]}<br/>
                      <span className="transform-gpu text-slate-300">{dateString.split(',')[1]}</span>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="transform-gpu px-8 py-16 text-center">
                    <div className="transform-gpu flex flex-col items-center gap-2 opacity-40">
                      <ShoppingBag size={32} />
                      <p className="transform-gpu text-xs font-bold uppercase tracking-widest text-slate-400">No orders recorded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination currentPage={page} hasMore={hasMore} />
    </div>
  );
}
