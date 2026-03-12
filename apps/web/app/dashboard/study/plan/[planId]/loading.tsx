// apps/web/app/dashboard/plans/[planId]/loading.tsx
export default function Loading() {
  return (
    <div className="transform-gpu p-6 max-w-5xl mx-auto animate-pulse">
      <div className="transform-gpu mb-6 space-y-2">
         <div className="transform-gpu h-4 w-24 bg-slate-200 rounded"></div>
         <div className="transform-gpu h-8 w-64 bg-slate-200 rounded"></div>
      </div>
      <div className="transform-gpu grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[1,2,3,4].map(i => (
           <div key={i} className="transform-gpu h-24 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
      <div className="transform-gpu h-64 bg-slate-200 rounded-xl"></div>
    </div>
  )
}