// packages/habits-core/src/lib/apiClient.ts

let accessToken: string | null = null;
let apiBaseUrl: string | null = null;

export const setHabitsAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setHabitsApiBaseUrl = (url: string) => {
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
  const finalUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(finalUrl, {
      ...options,
      credentials: options.credentials || 'include',
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    if (error.message === 'OFFLINE_MODE') throw error;
    if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      const err = new Error(`Connection lost. Working in offline mode.`);
      (err as any).isOffline = true;
      throw err;
    }
    throw error;
  }
}
