import "server-only";
import { env, ConfigError } from "./env";

/** Resend over HTTPS. Throws loudly when not configured; callers surface the error. */
export async function sendEmail(to: string, subject: string, text: string) {
  if (!env.resendKey || !env.emailFrom) throw new ConfigError("RESEND_API_KEY / EMAIL_FROM");
  const attempt = () =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.emailFrom, to, subject, text }),
    });
  let res = await attempt();
  if (!res.ok) res = await attempt();
  if (!res.ok) throw new Error(`Email send failed (${res.status}).`);
}

export const emailConfigured = () => Boolean(env.resendKey && env.emailFrom);
