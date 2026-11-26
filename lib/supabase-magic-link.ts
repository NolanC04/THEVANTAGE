import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Sends a sign-in link that works in any browser or on any device.
 * The default (PKCE) link only works in the browser that asked for it, which fails whenever a phone's
 * email app opens links in its own built-in browser. This link carries the session in the URL fragment;
 * /auth/confirm (or /airman/auth/confirm) stores it as the normal session cookie.
 */
export async function sendMagicLink(email: string, redirectTo: string, data?: Record<string, string>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const client = createClient(url, key, { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, ...(data ? { data } : {}) } });
  if (error) {
    if (/rate limit/i.test(error.message)) throw new RateLimited();
    throw new Error(error.message);
  }
}

/** Supabase's built-in mailer allows only a few sign-in emails per hour until a custom SMTP sender is set. */
export class RateLimited extends Error {
  constructor() { super("Too many sign-in emails were sent in the last hour. Use the most recent link in your inbox, or try again in about an hour."); }
}
