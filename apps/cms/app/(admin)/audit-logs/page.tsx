import { cms } from "@domain";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Search, Clock, History } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

export const metadata = {
  title: "Audit Logs | CMS Admin",
};

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({ searchParams }: { searchParams: { page?: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  const page = Number(searchParams.page || 1);
  const limit = 50;
  const skip = (page - 1) * limit;

  const logs = await cms.getAuditLogs(limit, skip);
  const hasMore = logs.length === limit;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">System Ledger</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Administrative Trace & Security Audit
          </p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-8 py-4">Action</th>
                <th className="px-8 py-4">Entity</th>
                <th className="px-8 py-4">Admin ID</th>
                <th className="px-8 py-4">Details</th>
                <th className="px-8 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50/50">
              {logs.map((log) => {
                const dateString = new Date(log.createdAt).toLocaleString();
                const actionColor = log.action.includes('DELETE') ? 'text-red-500 bg-red-50 border-red-100' : 
                                   log.action.includes('CREATE') ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                                   'text-blue-500 bg-blue-50 border-blue-100';

                return (
                  <tr key={log.id} className="hover:bg-rose-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${actionColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{log.entityType}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">{log.entityId}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[10px] font-bold text-slate-500 font-mono">#{log.adminId.slice(-8)}</div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-medium text-slate-600 max-w-md">{log.description}</p>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {dateString}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <History size={32} />
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No audit logs found</p>
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
