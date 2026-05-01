import { getAccessToken, getApiBaseUrl } from "../lib/nativeAuth";

async function authenticatedFetch(
  url: string,
  method: string,
  data?: any
) {
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
  delete: (url: string) => authenticatedFetch(url, "DELETE"),
};
