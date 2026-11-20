import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { env, supabaseConfigured, devStoreAllowed } from "./env";
import { store } from "./store";
import { supabaseSession } from "./supabase-server";
import type { Member } from "./types";

const DEV_COOKIE = "vantage_dev_session";
const devSecret = () => process.env.VANTAGE_DEV_SECRET ?? "dev-only-not-a-secret";

function signDev(email: string) {
  const mac = createHmac("sha256", devSecret()).update(email).digest("hex");
  return `${Buffer.from(email).toString("base64url")}.${mac}`;
}
function verifyDev(token: string): string | null {
  const [b64, mac] = token.split(".");
  if (!b64 || !mac) return null;
  const email = Buffer.from(b64, "base64url").toString();
  const expect = createHmac("sha256", devSecret()).update(email).digest("hex");
  const a = Buffer.from(mac), b = Buffer.from(expect);
  return a.length === b.length && timingSafeEqual(a, b) ? email : null;
}

/** Development sign-in exists only when Supabase is not configured and we are not in production. */
export const devAuth = () => !supabaseConfigured() && devStoreAllowed();

export async function devSignIn(email: string) {
  if (!devAuth()) throw new Error("Development sign-in is disabled.");
  (await cookies()).set(DEV_COOKIE, signDev(email.toLowerCase()), { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(DEV_COOKIE);
  if (supabaseConfigured()) await (await supabaseSession()).auth.signOut();
}

async function sessionIdentity(): Promise<{ id: string; email: string } | null> {
  if (supabaseConfigured()) {
    const { data } = await (await supabaseSession()).auth.getUser();
    return data.user?.email ? { id: data.user.id, email: data.user.email.toLowerCase() } : null;
  }
  if (!devAuth()) return null;
  const raw = (await cookies()).get(DEV_COOKIE)?.value;
  const email = raw ? verifyDev(raw) : null;
  if (!email) return null;
  return { id: "dev-" + createHmac("sha256", "id").update(email).digest("hex").slice(0, 16), email };
}

/** Current member, creating the members row on first sight. Null when signed out. */
export async function currentMember(): Promise<Member | null> {
  const who = await sessionIdentity();
  if (!who) return null;
  const db = store();
  const existing = await db.get<Member>("members", { id: who.id });
  if (existing) return existing;
  return db.insert<Member>("members", {
    id: who.id,
    email: who.email,
    tier: "free",
    verified_military: false,
    verification_type: null,
    verified_at: null,
    spouse_discount: false,
    stripe_customer_id: null,
    subscription_status: null,
  });
}

export const isAdmin = (m: Member | null) => Boolean(m && env.adminEmail && m.email === env.adminEmail);
