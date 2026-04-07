// apps/desktop/src/config/env.ts

const isDev = import.meta.env.DEV;

export type AppEnvironment = "development" | "staging" | "production";

const DEFAULT_WEB_ORIGINS: Record<AppEnvironment, string> = {
  development: "http://localhost:3000",
  staging: "https://staging.gritorquit.in",
  // Keep production default aligned with currently live domain.
  // Override with VITE_WEB_URL / VITE_API_BASE_URL when migrating domains.
  production: "https://www.dogritorquit.in",
};

const envFromVite = (import.meta.env.VITE_APP_ENV as AppEnvironment | undefined) ?? undefined;
export const APP_ENV: AppEnvironment = envFromVite ?? (isDev ? "development" : "production");
export const PRODUCTION_URL = DEFAULT_WEB_ORIGINS.production;

const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");

const normalizeApiOrigin = (value: string) => {
  const origin = normalizeOrigin(value);
  return origin.endsWith("/api") ? origin.slice(0, -4) : origin;
};

const joinPath = (base: string, path: string) => {
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

const defaultDevOrigin = DEFAULT_WEB_ORIGINS.development;
const defaultStageOrigin = DEFAULT_WEB_ORIGINS.staging;
const defaultProdOrigin = DEFAULT_WEB_ORIGINS.production;

const rawWebUrl = import.meta.env.VITE_WEB_URL || 
  (isDev 
    ? import.meta.env.VITE_DEV_WEB_URL || defaultDevOrigin
    : (APP_ENV === "staging" ? defaultStageOrigin : defaultProdOrigin));

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || rawWebUrl;

export const WEB_URL = normalizeOrigin(rawWebUrl);

// Keep this as the web origin, not the /api root. The desktop app has callers that
// append /api manually and shared packages that expect an origin for /api-prefixed paths.
export const API_BASE_URL = normalizeApiOrigin(rawApiBaseUrl);
export const API_ROOT_URL = `${API_BASE_URL}/api`;

export const buildApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/api/") ? path : joinPath("/api", path);
  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildWebUrl = (path = "") => joinPath(WEB_URL, path);
