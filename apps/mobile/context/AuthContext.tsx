import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Alert, DeviceEventEmitter } from "react-native";
import {
  clearStoredSession,
  fetchMe,
  getApiBaseUrl,
  getAccessToken as loadAccessToken,
  getStoredSession,
  type NativeSession,
  type NativeUser,
  setStoredSession,
} from "../lib/nativeAuth";

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = "google" | "github";

type AuthContextType = {
  session: NativeSession | null;
  loading: boolean;
  user: NativeUser | null;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  signInWithPhone: (_phone: string) => Promise<void>;
  verifyOtp: (_phone: string, _token: string) => Promise<void>;
};

type AuthResponse = {
  token_type: "bearer";
  access_token: string;
  expires_in: number;
  user: NativeUser;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  user: null,
  signOut: async () => {},
  signInWithOAuth: async () => {},
  signInWithEmail: async () => {},
  requestMagicLink: async () => {},
  signUpWithEmail: async () => {},
  requestPasswordReset: async () => {},
  setPassword: async () => {},
  getAccessToken: async () => null,
  signInWithPhone: async () => {},
  verifyOtp: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function extractNativeTokenFromUrl(url: string) {
  const source = url.includes("#") ? url.split("#")[1] : url.split("?")[1] ?? "";
  const params = new URLSearchParams(source);
  return {
    nativeToken: params.get("native_token") || "",
    error: params.get("error") || "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<NativeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const lastHandledUrlRef = useRef<string | null>(null);

  const applyToken = async (accessToken: string, expiresIn?: number) => {
    const me = await fetchMe(accessToken);
    if (!me) {
      throw new Error("Unable to load authenticated profile");
    }

    const nextSession = await setStoredSession({
      token_type: "bearer",
      access_token: accessToken,
      expires_in: expiresIn,
      user: me,
    });

    setSession(nextSession);
  };

  const restoreSession = async () => {
    const stored = await getStoredSession();
    if (!stored?.access_token) {
      setSession(null);
      return;
    }

    try {
      const me = await fetchMe(stored.access_token);
      if (!me) {
        await clearStoredSession();
        setSession(null);
        return;
      }

      const refreshed = await setStoredSession({
        token_type: "bearer",
        access_token: stored.access_token,
        refresh_token: stored.refresh_token,
        expires_in: stored.expires_in,
        user: me,
      });

      setSession(refreshed);
    } catch (error) {
      console.warn("[Auth] Network error during session restore. Using offline session.");
      setSession(stored);
    }
  };

  const handleDeepLink = async (url: string) => {
    if (lastHandledUrlRef.current === url) {
      return;
    }
    lastHandledUrlRef.current = url;

    const { nativeToken, error } = extractNativeTokenFromUrl(url);

    if (error) {
      throw new Error(error);
    }

    if (nativeToken) {
      await applyToken(nativeToken);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await restoreSession();
      } catch (error) {
        console.error("[Auth] Failed to restore session:", error);
        await clearStoredSession();
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    init();

    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url).catch((error) => {
        console.error("[Auth] Deep link handling failed:", error);
      });
    });

    Linking.getInitialURL().then((url) => {
      if (!url) return;
      handleDeepLink(url).catch((error) => {
        console.error("[Auth] Initial deep link failed:", error);
      });
    });

    const authExpiredSub = DeviceEventEmitter.addListener('auth:expired', () => {
      signOut().catch(console.error);
    });

    // When the auth/callback screen stores a token via OAuth, restore the session immediately
    const authReadySub = DeviceEventEmitter.addListener('auth:ready', () => {
      restoreSession().catch(console.error);
    });

    // SILENT REFRESH SENTINEL
    // Every 60 seconds, check if token is expiring in the next 5 mins
    const refreshSentinel = setInterval(async () => {
      const stored = await getStoredSession();
      if (!stored?.expires_at) return;

      const isExpiringSoon = stored.expires_at - Date.now() < 5 * 60 * 1000;
      if (isExpiringSoon) {
        console.log("[Auth] Token expiring soon, rotating...");
// @ts-ignore
        const next = await refreshSession();
        if (next) setSession(next);
      }
    }, 60000);

    // ACTIVE SESSION SENTINEL
    // Every 5 seconds, verify if the session has physically expired in the background
    // This ensures the UI unmounts immediately even if no network requests are made.
    const sentinel = setInterval(async () => {
      const stored = await getStoredSession();
      if (!stored) {
        setSession(null);
      }
    }, 5000);

    return () => {
      subscription.remove();
      authExpiredSub.remove();
      authReadySub.remove();
      clearInterval(sentinel);
      clearInterval(refreshSentinel);
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const url = `${getApiBaseUrl()}/api/native-auth/credentials/login`;
    console.log(`[Auth] Attempting sign in at: ${url}`);
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await res.json()) as AuthResponse | { error?: string; message?: string };
      if (!res.ok) {
        const errPayload = payload as { error?: string; message?: string };
        throw new Error(errPayload.message ?? errPayload.error ?? "Sign in failed");
      }

      const authPayload = payload as AuthResponse;
      await applyToken(authPayload.access_token, authPayload.expires_in);
    } catch (error) {
      console.error(`[Auth] Sign in request failed for ${url}:`, error);
      throw error;
    }
  };

  const requestMagicLink = async (email: string) => {
    const callbackUrl = Linking.createURL("auth/callback");
    const url = `${getApiBaseUrl()}/api/native-auth/magic-link/request`;
    console.log(`[Auth] Requesting magic link at: ${url}`);
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectUri: callbackUrl }),
      });

      const payload = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(payload.error ?? payload.message ?? "Magic link sign-in is unavailable");
      }
    } catch (error) {
      console.error(`[Auth] Magic link request failed for ${url}:`, error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const url = `${getApiBaseUrl()}/api/native-auth/credentials/register`;
    console.log(`[Auth] Attempting sign up at: ${url}`);
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const payload = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(payload.error ?? "Sign up failed");
      }
    } catch (error) {
      console.error(`[Auth] Sign up request failed for ${url}:`, error);
      throw error;
    }
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    setLoading(true);
    try {
      const callbackUrl = Linking.createURL("auth/callback");
      const startUrl = `${getApiBaseUrl()}/api/native-auth/start/${provider}?redirect_uri=${encodeURIComponent(callbackUrl)}`;

      const authResult = await WebBrowser.openAuthSessionAsync(startUrl, callbackUrl);

      if (authResult.type === "success" && authResult.url) {
        await handleDeepLink(authResult.url);
        return;
      }

      if (authResult.type !== "cancel" && authResult.type !== "dismiss") {
        throw new Error(`Unexpected OAuth result: ${authResult.type}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not connect OAuth provider";
      console.error("[Auth] OAuth error:", error);
      Alert.alert("Sign In Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const token = await loadAccessToken();
      if (token) {
        await fetch(`${getApiBaseUrl()}/api/native-auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => undefined);
      }
    } finally {
      await clearStoredSession();
      setSession(null);
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    const res = await fetch(`${getApiBaseUrl()}/api/native-auth/password/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(payload.error ?? "Password reset is unavailable");
    }
  };

  const setPassword = async (password: string) => {
    const token = await loadAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const res = await fetch(`${getApiBaseUrl()}/api/native-auth/password/set`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(payload.error ?? "Failed to set password");
    }
  };

  const signInWithPhone = async () => {
    throw new Error("Phone OTP login is not available in centralized auth yet");
  };

  const verifyOtp = async () => {
    throw new Error("Phone OTP verification is not available in centralized auth yet");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        user: session?.user ?? null,
        signOut,
        signInWithOAuth,
        signInWithEmail,
        requestMagicLink,
        signUpWithEmail,
        requestPasswordReset,
        setPassword,
        getAccessToken: loadAccessToken,
        signInWithPhone,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
