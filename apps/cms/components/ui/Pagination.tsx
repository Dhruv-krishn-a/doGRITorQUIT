"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function Pagination({ currentPage, hasMore }: { currentPage: number, hasMore: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return params.toString();
  };

  const handlePageChange = (page: number) => {
    router.push(`${pathname}?${createQueryString(page)}`);
  };

  if (currentPage === 1 && !hasMore) return null;

  return (
    <div className="transform-gpu flex items-center justify-center gap-4 mt-10">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="transform-gpu p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-rose-500 hover:border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
      >
        <ChevronLeft size={20} />
      </button>
      
      <span className="transform-gpu text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
        Page {currentPage}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasMore}
        className="transform-gpu p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-rose-500 hover:border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
