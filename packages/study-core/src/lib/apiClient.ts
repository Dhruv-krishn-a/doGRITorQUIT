// packages/study-core/src/lib/apiClient.ts

const getBaseUrl = () => {
  if (typeof window === 'undefined') return ''; // Server-side usage
  
  // Next.js: process.env.NEXT_PUBLIC_API_URL
  // Vite (Tauri): import.meta.env.VITE_API_BASE_URL
  // Fallback to relative path for current domain (Next.js/Desktop relative)
  
  // @ts-ignore
  return window.NEXT_PUBLIC_API_URL || window.VITE_API_BASE_URL || '';
};

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': (window as any).SUPABASE_SESSION_TOKEN ? `Bearer ${(window as any).SUPABASE_SESSION_TOKEN}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
