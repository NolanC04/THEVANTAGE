import "server-only";
import { store } from "./store";
import { sendEmail, emailConfigured } from "./email";
import { notificationEmail } from "./privacy";
import { env } from "./env";
import type { Profile } from "./auth";

/** Content-free notifications. If email isn't configured the in-app thread still works; the failure is logged, not hidden. */
export async function notify(to: string[], path: string) {
  if (!to.length) return { sent: 0, skipped: "no recipients" };
  if (!emailConfigured()) {
    console.warn("notify: email not configured; in-app only");
    return { sent: 0, skipped: "email not configured" };
  }
  const { subject, text } = notificationEmail(`${env.siteUrl}${path}`);
  await Promise.all(to.map((t) => sendEmail(t, subject, text)));
  return { sent: to.length };
}

export async function staffEmails() {
  const staff = await store().list<Profile>("profiles");
  return staff.filter((s) => s.role === "facilitator" || s.role === "admin").map((s) => s.email);
}
