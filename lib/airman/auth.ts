import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { env, supabaseConfigured, devStoreAllowed } from "./env";
import { store } from "./store";
import { supabaseSession } from "./supabase-server";

export type Role = "learner" | "assistant" | "facilitator" | "admin" | "comparison" | "rater";
export interface Profile {
  id: string;
  email: string;
  role: Role;
  unit: string | null;
  flight: string | null;
  anon_id: string; // AX-XXXX## — the only identifier GENE and reports ever see
  display_name: string | null;
  consented_at: string | null;
  created_at: string;
}

const DEV_COOKIE = "apex_dev_session";
const devSecret = () => process.env.APEX_DEV_SECRET ?? "dev-only-not-a-secret";
const sign = (email: string) => `${Buffer.from(email).toString("base64url")}.${createHmac("sha256", devSecret()).update(email).digest("hex")}`;
function verify(token: string) {
  const [b64, mac] = token.split(".");
  if (!b64 || !mac) return null;
  const email = Buffer.from(b64, "base64url").toString();
  const a = Buffer.from(mac), b = Buffer.from(createHmac("sha256", devSecret()).update(email).digest("hex"));
  return a.length === b.length && timingSafeEqual(a, b) ? email : null;
}

export const devAuth = () => !supabaseConfigured() && devStoreAllowed();
export async function devSignIn(email: string) {
  if (!devAuth()) throw new Error("Development sign-in is disabled.");
  (await cookies()).set(DEV_COOKIE, sign(email.toLowerCase()), { httpOnly: true, sameSite: "lax", path: "/" });
}
export async function signOut() {
  (await cookies()).delete(DEV_COOKIE);
  if (supabaseConfigured()) await (await supabaseSession()).auth.signOut();
}

async function identity() {
  if (supabaseConfigured()) {
    const { data } = await (await supabaseSession()).auth.getUser();
    const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
    return data.user?.email ? { id: data.user.id, email: data.user.email.toLowerCase(), invite: typeof meta.apex_invite === "string" ? meta.apex_invite : null, consent: meta.apex_consent === "1" } : null;
  }
  if (!devAuth()) return null;
  const raw = (await cookies()).get(DEV_COOKIE)?.value;
  const email = raw ? verify(raw) : null;
  return email ? { id: "dev-" + createHmac("sha256", "id").update(email).digest("hex").slice(0, 16), email } : null;
}

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
export const newAnonId = () => `AX-${Array.from({ length: 4 }, () => LETTERS[randomInt(LETTERS.length)]).join("")}${String(randomInt(100)).padStart(2, "0")}`;

/** Current profile. First sign-in creates it; the env admin email becomes admin (seed). */
export async function currentProfile(): Promise<Profile | null> {
  const who = await identity();
  if (!who) return null;
  const db = store();
  const existing = await db.get<Profile>("profiles", { id: who.id });
  if (existing) return existing;
  const jar = await cookies();
  const code = (jar.get("apex_invite")?.value ?? ("invite" in who ? who.invite : null) ?? undefined)?.toUpperCase();
  const invite = code ? await db.get<{ id: string; role: Role; unit: string | null; flight: string | null; class_id: string | null }>("invites", { code, active: true }) : null;
  const isEnvAdmin = Boolean(env.adminEmail && who.email === env.adminEmail);
  if (!invite && !isEnvAdmin) return null; // first sign-in needs an invite code
  const role: Role = isEnvAdmin ? "admin" : invite!.role;
  const consented = jar.get("apex_consent")?.value === "1" || ("consent" in who && who.consent) ? new Date().toISOString() : null;
  const profile = await db.insert<Profile>("profiles", { id: who.id, email: who.email, role, unit: invite?.unit ?? null, flight: invite?.flight ?? null, anon_id: newAnonId(), display_name: null, consented_at: consented });
  if (invite?.class_id) await db.insert("class_members", { class_id: invite.class_id, user_id: profile.id, role: role === "comparison" ? "comparison" : "cohort" });
  await db.insert("audit_log", { actor_id: profile.id, actor_anon: profile.anon_id, action: "profile.created", target: profile.id, detail: { role, via: invite ? "invite" : "env-admin" }, at: new Date().toISOString() });
  return profile;
}

export const canFacilitate = (p: Profile | null) => p?.role === "facilitator" || p?.role === "admin";
export const isAdmin = (p: Profile | null) => p?.role === "admin";

export const homeOf = (role: Role) => (role === "facilitator" || role === "admin" ? "/airman/facilitator" : role === "rater" ? "/airman/rate" : "/airman/app");

/** Page guard. Learners never reach facilitator or admin pages. */
export async function requireRole(roles: Role[]): Promise<Profile> {
  const p = await currentProfile();
  if (!p) redirect("/airman");
  if (!roles.includes(p.role)) redirect(homeOf(p.role));
  return p;
}

export async function audit(actor: Profile, action: string, target: string, detail: Record<string, unknown> = {}) {
  await store().insert("audit_log", { actor_id: actor.id, actor_anon: actor.anon_id, action, target, detail, at: new Date().toISOString() });
}
