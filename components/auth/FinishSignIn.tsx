"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/** Reads the session a sign-in link carries in the URL fragment, stores it as the session cookie, then moves on. */
export function FinishSignIn({ then, retryHref, className }: { then: string; retryHref: string; className?: string }) {
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    const q = new URLSearchParams(window.location.search);
    const fail = h.get("error_description") || q.get("error_description");
    if (fail) { setErr(fail.replace(/\+/g, " ")); return; }
    const access_token = h.get("access_token"), refresh_token = h.get("refresh_token");
    if (!access_token || !refresh_token) { setErr("This link is missing its sign-in details."); return; }
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    sb.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) setErr(error.message);
      else window.location.replace(then);
    });
  }, [then]);
  return (
    <div className={className} role="status" aria-live="polite">
      {err ? (
        <>
          <p>That sign-in link didn&apos;t work: {err}</p>
          <p><a href={retryHref}>Send a fresh link</a></p>
        </>
      ) : (
        <p>Signing you in…</p>
      )}
    </div>
  );
}

/** Safety net on every page: a sign-in link that landed somewhere other than its confirm page is passed along. */
export function SignInCatcher() {
  useEffect(() => {
    const { hash, search, pathname } = window.location;
    if (pathname.endsWith("/auth/confirm")) return;
    const airman = pathname.startsWith("/airman");
    if (hash.includes("access_token=") || hash.includes("error_description=")) {
      window.location.replace((airman ? "/airman/auth/confirm" : "/auth/confirm") + search + hash);
    } else if (new URLSearchParams(search).get("code") && !pathname.endsWith("/auth/callback")) {
      window.location.replace((airman ? "/airman/auth/callback" : "/auth/callback") + search);
    }
  }, []);
  return null;
}
