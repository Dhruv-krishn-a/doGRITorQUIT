import { useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, DeviceEventEmitter } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  fetchMe,
  setStoredSession,
} from "../../lib/nativeAuth";

/**
 * OAuth / Magic-Link callback screen.
 *
 * When the server redirects back to  gritio:///auth/callback?native_token=...
 * Expo Router opens this screen instead of showing "Unmatched Route".
 *
 * We read `native_token` (success) or `error` from the URL params,
 * store the session, then let AuthContext redirect to the right place.
 */
export default function AuthCallback() {
  const params = useLocalSearchParams<{
    native_token?: string;
    error?: string;
    error_description?: string;
  }>();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    // Guard against double-fire (StrictMode / HMR)
    if (handled.current) return;
    handled.current = true;

    const run = async () => {
      const { native_token, error } = params;

      if (error) {
        console.error("[AuthCallback] OAuth error:", error, params.error_description);
        // Navigate back to login and show an alert
        router.replace({
          pathname: "/(auth)/login",
          params: { oauth_error: error },
        });
        return;
      }

      if (!native_token) {
        // No token and no error — just go home, AuthContext will redirect
        router.replace("/");
        return;
      }

      try {
        // Fetch the user profile and persist the session
        const me = await fetchMe(native_token);
        if (!me) {
          throw new Error("Could not load user profile");
        }

        await setStoredSession({
          token_type: "bearer",
          access_token: native_token,
          expires_in: 60 * 60 * 24 * 7, // 7 days (matches server)
          user: me,
        });

        // Notify AuthContext to restore session immediately (don't wait for sentinel poll)
        DeviceEventEmitter.emit("auth:ready");

        // Navigate to root — AuthContext will have the session by now
        router.replace("/");
      } catch (err) {
        console.error("[AuthCallback] Failed to apply token:", err);
        router.replace({
          pathname: "/(auth)/login",
          params: { oauth_error: "token_error" },
        });
      }
    };

    run().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0b0c10" }}>
      <ActivityIndicator size="large" color="#a78bfa" />
      <Text style={{ color: "#9ca3af", marginTop: 16, fontSize: 13, fontWeight: "700" }}>
        Completing sign in…
      </Text>
    </View>
  );
}
