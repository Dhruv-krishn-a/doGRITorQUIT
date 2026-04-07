declare module "react-dom" {
  import type * as React from "react";

  export function createPortal(
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string
  ): React.ReactPortal;

  export function useFormStatus(): {
    pending: boolean;
    data: FormData | null;
    method: string | null;
    action: string | null;
  };
}
