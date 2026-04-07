"use client";

import { toast } from "sonner";
import { useRef } from "react";

interface Props {
  action: (formData: FormData) => Promise<any>;
  children: React.ReactNode;
  successMessage?: string;
  errorMessage?: string;
}

export function InlineFormWrapper({ action, children, successMessage = "Updated successfully", errorMessage = "Failed to update" }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await action(formData);
      if (result && result.success === false) {
        toast.error(result.error || errorMessage);
      } else {
        toast.success(successMessage);
      }
    } catch (err) {
      toast.error(errorMessage);
    }
  };

  return (
    <form ref={formRef} action={handleSubmit}>
      {children}
    </form>
  );
}
