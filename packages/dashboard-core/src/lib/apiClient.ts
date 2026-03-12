// packages/study-core/src/lib/apiClient.ts

let accessToken: string | null = null;
let apiBaseUrl: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setApiBaseUrl = (url: string) => {
  apiBaseUrl = url;
};

const getBaseUrl = () => {
  return apiBaseUrl || '';
};

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    credentials: options.credentials || 'include',
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
