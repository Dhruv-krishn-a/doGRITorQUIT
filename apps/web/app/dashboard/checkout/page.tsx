import { getServerUser } from "@/lib/auth-server";
import { payment } from "@gritorquit/domain";
import { redirect } from "next/navigation";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ plan?: string }> 
}) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const planKey = params.plan;

  if (!planKey) redirect("/dashboard/subscriptions");

  const plans = await payment.getPublicPlans();
  const plan = plans.find(p => p.key === planKey);

  if (!plan) redirect("/dashboard/subscriptions");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 md:p-10">
       <CheckoutClient user={user} plan={plan} />
    </div>
  );
}
