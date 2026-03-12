import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { supabase } from "../../lib/supabase";

export function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const unlisten = onOpenUrl((urls) => {
      for (const url of urls) {
        if (url.startsWith("planner://auth/callback")) {
          const fragment = url.split("#")[1];
          if (fragment) {
            const params = new URLSearchParams(fragment);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");
            if (accessToken && refreshToken) {
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              }).then(() => {
                navigate("/", { replace: true });
              });
            }
          }
        }
      }
    });
    return () => {
      unlisten.then((f: any) => f());
    };
  }, [navigate]);

  return null;
}
