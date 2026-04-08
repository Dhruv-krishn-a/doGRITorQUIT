// apps/desktop/src/config/env.ts

const isDev = import.meta.env.DEV;
const mode = import.meta.env.MODE as AppEnvironment;

export type AppEnvironment = "development" | "staging" | "production";

const DEFAULT_WEB_ORIGINS: Record<AppEnvironment, string> = {
  development: "http://localhost:3000",
  staging: "https://staging.gritorquit.in",
  production: "https://www.dogritorquit.in",
};

// Source of truth: Vite Env Var > Vite Mode > Development default
export const APP_ENV: AppEnvironment = (import.meta.env.VITE_APP_ENV as AppEnvironment) || mode || (isDev ? "development" : "production");

const normalizeOrigin = (value: string) => value?.trim().replace(/\/+$/, "") || "";

const normalizeApiOrigin = (value: string) => {
  const origin = normalizeOrigin(value);
  return origin.endsWith("/api") ? origin.slice(0, -4) : origin;
};

const joinPath = (base: string, path: string) => {
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

// Priority: Explicit Var > Default for detected Env
const rawWebUrl = import.meta.env.VITE_WEB_URL || DEFAULT_WEB_ORIGINS[APP_ENV] || DEFAULT_WEB_ORIGINS.production;
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || rawWebUrl;

export const WEB_URL = normalizeOrigin(rawWebUrl);
export const API_BASE_URL = normalizeApiOrigin(rawApiBaseUrl);
export const API_ROOT_URL = `${API_BASE_URL}/api`;

export const buildApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/api/") ? path : joinPath("/api", path);
  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildWebUrl = (path = "") => joinPath(WEB_URL, path);
