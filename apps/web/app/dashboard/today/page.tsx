import React, { Suspense } from "react";
import { getServerUser } from "@/lib/auth-server"; 
import { redirect } from "next/navigation";
import TodayUI from "./TodayUI";

export default async function TodayPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-10">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-rose-500 font-black uppercase tracking-widest text-xs">Synchronizing Horizon...</div>
        </div>
      }>
        <TodayUI />
      </Suspense>
    </div>
  );
}
