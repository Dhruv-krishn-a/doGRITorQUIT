//apps/desktop/src/services/api.ts
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config/env';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
  };
}

export const api = {
  async get(endpoint: string) {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        throw new Error(`Could not connect to backend at ${API_BASE_URL}. Ensure the web app is running.`);
      }
      throw error;
    }
  },

  async post(endpoint: string, body: any) {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        throw new Error(`Could not connect to backend at ${API_BASE_URL}. Ensure the web app is running.`);
      }
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        throw new Error(`Could not connect to backend at ${API_BASE_URL}. Ensure the web app is running.`);
      }
      throw error;
    }
  },
};
