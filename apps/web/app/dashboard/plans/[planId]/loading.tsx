// apps/web/app/dashboard/plans/[planId]/loading.tsx
export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="mb-6 space-y-2">
         <div className="h-4 w-24 bg-slate-200 rounded"></div>
         <div className="h-8 w-64 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[1,2,3,4].map(i => (
           <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-xl"></div>
    </div>
  )
}