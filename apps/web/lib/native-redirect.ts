const allowedSchemes = [
  "gritorquit://",
  "grit.io://",
  "grit-io://",
  "exp+mobile://",
  "exp://",
  "com.gritorquit.app://",
];
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.dogritorquit.in",
  "https://dogritorquit.in",
  "https://gritorquit.in",
  "https://www.gritorquit.in",
];

export function sanitizeNativeRedirectUri(uri: string | null): string | null {
  if (!uri) return null;

  const trimmed = uri.trim();
  if (!trimmed) return null;

  if (allowedSchemes.some((scheme) => trimmed.startsWith(scheme))) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (allowedOrigins.includes(parsed.origin)) {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}
