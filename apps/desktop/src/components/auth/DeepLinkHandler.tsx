import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onOpenUrl, getCurrent } from "@tauri-apps/plugin-deep-link";
import { useAuth, authService } from "../../features/auth/hooks/useAuth";
import { buildApiUrl } from "../../config/env";

export function DeepLinkHandler() {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const pendingUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const isTauri = "__TAURI_INTERNALS__" in window;
    if (!isTauri) return;

    getCurrent().then((urls) => {
      if (urls && urls.length > 0) {
        console.log("[DeepLink] Initial URLs:", urls);
        for (const url of urls) {
          if (url.startsWith("gritio://auth/callback") || url.startsWith("gritorquit://auth/callback") || url.startsWith("grit.io://auth/callback") || url.startsWith("grit-io://auth/callback")) {
            pendingUrlRef.current = url;
            break;
          }
        }
      }
    }).catch(console.error);

    const unlisten = onOpenUrl((urls) => {
      console.log("[DeepLink] Received URLs:", urls);
      for (const url of urls) {
        if (url.startsWith("gritio://auth/callback") || url.startsWith("gritorquit://auth/callback") || url.startsWith("grit.io://auth/callback") || url.startsWith("grit-io://auth/callback")) {
          pendingUrlRef.current = url;
          // Trigger a re-render or effect to process it immediately
          window.dispatchEvent(new Event("deep_link_received"));
          break;
        }
      }
    });
    
    return () => {
      unlisten.then((f: any) => f());
    };
  }, []);

  const processPendingUrl = () => {
    if (loading || !pendingUrlRef.current) return;

    const url = pendingUrlRef.current;
    const fragment = url.split("#")[1] || url.split("?")[1];
    
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const nativeToken = params.get("native_token");
      const accessToken = params.get("access_token");
      const type = params.get("type");
      const error = params.get("error");
      const errorDesc = params.get("error_description");

      if (error) {
        pendingUrlRef.current = null;
        window.dispatchEvent(new CustomEvent("oauth_error", { detail: errorDesc || error }));
        navigate("/login", { replace: true });
        return;
      }
      
      const token = nativeToken || accessToken;
      if (token) {
        fetch(buildApiUrl('/native-auth/me'), {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(user => {
          if (user && !user.error) {
            authService.setSession({ access_token: token, user });
            pendingUrlRef.current = null;
            
            if (type === "recovery" || url.includes("next=%2Fauth%2Fupdate-password")) {
              navigate("/auth/update-password", { replace: true });
            } else {
              navigate("/", { replace: true });
            }
          } else {
            window.dispatchEvent(new CustomEvent("oauth_error", { detail: "User retrieval failed" }));
            navigate("/login", { replace: true });
          }
        })
        .catch(err => {
          console.error(err);
          window.dispatchEvent(new CustomEvent("oauth_error", { detail: "Network error during token validation" }));
          navigate("/login", { replace: true });
        });
      }
    }
  };

  useEffect(() => {
    processPendingUrl();
    const handleDeepLinkEvent = () => processPendingUrl();
    window.addEventListener("deep_link_received", handleDeepLinkEvent);
    return () => {
      window.removeEventListener("deep_link_received", handleDeepLinkEvent);
    };
  }, [loading, navigate]);

  return null;
}
