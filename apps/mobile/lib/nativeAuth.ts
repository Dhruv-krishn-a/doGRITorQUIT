import * as SecureStore from "expo-secure-store";
import { config } from "../config";

const STORAGE_KEY = "native_auth_session_v1";

export type NativeUser = {
  id: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
};

export type NativeSession = {
  token_type: "bearer";
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at: number;
  user: NativeUser;
};

export function getApiBaseUrl() {
  return config.apiUrl.replace(/\/$/, "");
}

function buildSession(payload: {
  token_type?: string;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: NativeUser;
}): NativeSession {
  const expiresIn = Math.max(60, Number(payload.expires_in ?? 60 * 60 * 24 * 7));
  return {
    token_type: "bearer",
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_in: expiresIn,
    expires_at: Date.now() + expiresIn * 1000,
    user: payload.user,
  };
}

export async function refreshSession(): Promise<NativeSession | null> {
  const current = await getStoredSession();
  if (!current?.refresh_token) return null;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: current.refresh_token }),
    });

    if (res.ok) {
      const data = await res.json();
      return await setStoredSession(data);
    } else {
      await clearStoredSession();
      return null;
    }
  } catch (e) {
    return null;
  }
}

export async function getStoredSession(): Promise<NativeSession | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as NativeSession;
    if (!parsed?.access_token || !parsed?.user?.id) {
      return null;
    }

    if (parsed.expires_at && parsed.expires_at < Date.now()) {
      await clearStoredSession();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setStoredSession(payload: {
  token_type?: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user: NativeUser;
}): Promise<NativeSession> {
  const session = buildSession({ ...payload, refresh_token: payload.refresh_token ?? "" });
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function clearStoredSession() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getStoredSession();
  return session?.access_token ?? null;
}

export async function fetchMe(token: string): Promise<NativeUser | null> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  const payload = (await res.json()) as {
    id: string;
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  };

  return {
    id: payload.id,
    email: payload.email ?? null,
    name: payload.name ?? null,
    image: payload.avatarUrl ?? null,
  };
}
