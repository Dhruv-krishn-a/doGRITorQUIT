import { getAccessToken, getApiBaseUrl, refreshSession } from "../lib/nativeAuth";
import { DeviceEventEmitter } from "react-native";

async function authenticatedFetch(
  url: string,
  method: string,
  data?: any
): Promise<any> {
  const token = await getAccessToken();
  const baseUrl = getApiBaseUrl();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${baseUrl}${url}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      console.log("[API] Unauthorized, attempting token rotation...");
      const nextSession = await refreshSession();
      if (nextSession) {
        // Retry the original request
        return await authenticatedFetch(url, method, data);
      }

      DeviceEventEmitter.emit('auth:expired');
      throw new Error('AUTH_EXPIRED');
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
  get: (url: string) => authenticatedFetch(url, "GET"),
  post: (url: string, data: any) => authenticatedFetch(url, "POST", data),
  put: (url: string, data: any) => authenticatedFetch(url, "PUT", data),
  patch: (url: string, data: any) => authenticatedFetch(url, "PATCH", data),
  delete: (url: string) => authenticatedFetch(url, "DELETE"),
};
