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

export const api = {
  async get(endpoint: string) {
    try {
      if (!navigator.onLine) {
        throw new Error('OFFLINE_MODE');
      }
      const headers = await getHeaders();
      const response = await fetch(buildApiUrl(endpoint), { headers });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    } catch (error: any) {
      if (error.message === 'OFFLINE_MODE') throw error;
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
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    } catch (error: any) {
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
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    } catch (error: any) {
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
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    } catch (error: any) {
      if (error.message === 'OFFLINE_MODE' || error.name === 'TypeError') {
        const err = new Error(`Connection lost. Action will be queued.`);
        (err as any).isOffline = true;
        throw err;
      }
      throw error;
    }
  },
};
