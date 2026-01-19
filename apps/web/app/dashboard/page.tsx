import React, { Suspense } from "react";
import { getServerUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { dashboard } from "@domain";
import DashboardUI from "./DashboardUI";
import Loading from "./loading";

export default async function DashboardHome() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Hello, <span className="text-transparent bg-clip-text  from-indigo-600 to-violet-600 bg-linear-to-r">{firstName}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Let&apos;s make today productive.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Async Content Wrapper */}
      <Suspense fallback={<Loading />}>
        <AsyncDashboardWrapper userId={user.id} />
      </Suspense>
    </div>
  );
}

// Separate async component to fetch data
async function AsyncDashboardWrapper({ userId }: { userId: string }) {
  const data = await dashboard.getDashboardStats(userId);

  if (!data) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 text-center">
        Unable to load dashboard data. Please try again later.
      </div>
    );
  }

  // Sanitization: Convert DB 'null's to TypeScript 'undefined's
  const sanitizedData = {
    ...data,
    todaysTasks: data.todaysTasks.map((task) => ({
      ...task,
      estimatedMinutes: task.estimatedMinutes ?? undefined,
      // Removed access to task.startTime as it does not exist on the source type
    })),
  };

  return <DashboardUI data={sanitizedData} />;
}