// apps/web/utils/api.ts
import { signOut } from "next-auth/react";

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      // Automatically sign out on unauthorized
      await signOut({ callbackUrl: "/login", redirect: true });
      throw new Error("AUTH_EXPIRED");
    }
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
}

export const api = {
  async get(url: string) {
    const res = await fetch(url);
    return handleResponse(res);
  },
  async post(url: string, data: any) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async put(url: string, data: any) {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async patch(url: string, data: any) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async delete(url: string) {
    const res = await fetch(url, { method: "DELETE" });
    return handleResponse(res);
  },
};
