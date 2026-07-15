"use client";

import { useActionState } from "react";
import { refundSubscriptionAction } from "./actions";
import { RefreshCcw } from "lucide-react";

export function RefundButton({ providerPaymentId }: { providerPaymentId: string }) {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await refundSubscriptionAction(formData);
  }, null);

  return (
    <form action={action} className="mt-2">
      <input type="hidden" name="providerPaymentId" value={providerPaymentId} />
      <button 
        type="submit" 
        disabled={isPending}
        className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-rose-100 hover:bg-rose-100 transition-colors disabled:opacity-50"
      >
        <RefreshCcw size={10} />
        {isPending ? "Refunding..." : "Refund"}
      </button>
      {state && !state.success && (
        <p className="text-rose-500 text-[8px] mt-1 uppercase">{state.error}</p>
      )}
    </form>
  );
}
