import { entry } from "@gritorquit/domain"; 
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText, Plus, FileEdit, ExternalLink, RefreshCw } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";

export const metadata = {
  title: "Content Management | CMS Admin",
};

export const dynamic = "force-dynamic";

export default async function ContentPage({ searchParams }: { searchParams: { page?: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  const page = Number(searchParams.page || 1);
  const limit = 50;
  const skip = (page - 1) * limit;

  const [entries, contentTypes] = await Promise.all([
    entry.getAllEntries(limit, skip),
    entry.getContentTypes()
  ]);

  const hasMore = entries.length === limit;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">Content Management</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Manage dynamic entries for blogs, updates, and more
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="px-5 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-sm active:scale-95 flex items-center gap-2">
            <Plus size={16} /> New Entry
          </button>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-8 py-4">Title / Slug</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Author</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50/50">
              {entries.map((item) => {
                const date = new Date(item.createdAt).toLocaleDateString();
                const authorName = (item.createdBy as any)?.profile?.name || (item.createdBy as any)?.email || "Unknown";

                return (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 tracking-tight">{item.title || "Untitled Entry"}</div>
                          <div className="text-[10px] text-slate-400 font-medium font-mono">{item.slug || `ID: ${item.id.slice(0,8)}...`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-slate-200">
                        {item.contentType?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{authorName}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">{date}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                        item.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'archived' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-emerald-400' : item.status === 'archived' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <FileEdit size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <FileText size={32} />
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No content entries found</p>
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
