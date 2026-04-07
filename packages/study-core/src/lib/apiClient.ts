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
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    const error = new Error('OFFLINE_MODE');
    (error as any).isOffline = true;
    throw error;
  }

  const baseUrl = getBaseUrl();
  const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(fullUrl, {
      ...options,
      credentials: options.credentials || 'include',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const err = new Error('Network timeout. Working in offline mode.');
      (err as any).isOffline = true;
      throw err;
    }
    if (error.message === 'OFFLINE_MODE') throw error;
    if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      const err = new Error(`Connection lost. Working in offline mode.`);
      (err as any).isOffline = true;
      throw err;
    }
    throw error;
  }
}
