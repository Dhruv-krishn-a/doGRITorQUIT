export {};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: RazorpaySuccessResponse) => void;
    theme?: { color: string };
    modal?: { ondismiss?: () => void };
  }

  interface RazorpayInstance {
    open(): void;
    on(
      event: "payment.failed",
      handler: (response: RazorpayErrorResponse) => void
    ): void;
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayErrorResponse {
    error: {
      code: string;
      description: string;
      reason: string;
      source: string;
      step: string;
      metadata: Record<string, unknown>;
    };
  }
}
