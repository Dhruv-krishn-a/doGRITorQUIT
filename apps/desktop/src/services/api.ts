//apps/desktop/src/services/api.ts
import { authService } from '../features/auth/hooks/useAuth';
import { API_ROOT_URL, buildApiUrl } from '../config/env';

async function getHeaders() {
  const session = authService.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
  };
}
const handleResponse = async (response: Response, retryFn: () => Promise<any>) => {
  if (!response.ok) {
    if (response.status === 401) {
      console.log("[API] Unauthorized, attempting token rotation...");
      const nextSession = await authService.refresh();
      if (nextSession) {
        return await retryFn();
      }

      authService.logout();
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

export const api = {
  async get(endpoint: string) {
    try {
      if (!navigator.onLine) {
        throw new Error('OFFLINE_MODE');
      }
      const headers = await getHeaders();
      const response = await fetch(buildApiUrl(endpoint), { headers });
      return await handleResponse(response, () => this.get(endpoint));
    } catch (error: any) {
      if (error.message === 'OFFLINE_MODE' || error.message === 'AUTH_EXPIRED') throw error;
      if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        const err = new Error(`Connection lost. Working in offline mode.`);
        (err as any).isOffline = true;
        throw err;
      }
      throw error;
    }
  },

  async post(endpoint: string, body: any) {
    try {
      if (!navigator.onLine) throw new Error('OFFLINE_MODE');
      const headers = await getHeaders();
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      return await handleResponse(response, () => this.post(endpoint, body));
    } catch (error: any) {
      if (error.message === 'AUTH_EXPIRED') throw error;
      if (error.message === 'OFFLINE_MODE' || error.name === 'TypeError') {
        const err = new Error(`Connection lost. Changes will be saved locally.`);
        (err as any).isOffline = true;
        throw err;
      }
      throw error;
    }
  },

  async patch(endpoint: string, body: any) {
    try {
      if (!navigator.onLine) throw new Error('OFFLINE_MODE');
      const headers = await getHeaders();
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      return await handleResponse(response, () => this.patch(endpoint, body));
    } catch (error: any) {
      if (error.message === 'AUTH_EXPIRED') throw error;
      if (error.message === 'OFFLINE_MODE' || error.name === 'TypeError') {
        const err = new Error(`Connection lost. Changes will be saved locally.`);
        (err as any).isOffline = true;
        throw err;
      }
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      if (!navigator.onLine) throw new Error('OFFLINE_MODE');
      const headers = await getHeaders();
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'DELETE',
        headers,
      });
      return await handleResponse(response, () => this.delete(endpoint));
    } catch (error: any) {
      if (error.message === 'AUTH_EXPIRED') throw error;
      if (error.message === 'OFFLINE_MODE' || error.name === 'TypeError') {
        const err = new Error(`Connection lost. Action will be queued.`);
        (err as any).isOffline = true;
        throw err;
      }
      throw error;
    }
  },
};
