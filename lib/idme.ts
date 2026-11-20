import "server-only";
import { env, ConfigError } from "./env";

/**
 * ID.me OAuth (group verification). We request the "military" scope and read only the
 * verified group/subgroup. No documents or images ever pass through or are stored here.
 * [VERIFY with ID.me before launch: scope name and subgroup labels for the military group.]
 */
const base = () => (env.idmeEnv === "production" ? "https://api.id.me" : "https://api.idmelabs.com");
export const redirectUri = () => `${env.siteUrl}/api/verify/idme/callback`;

export function authorizeUrl(state: string) {
  if (!env.idmeClientId) throw new ConfigError("IDME_CLIENT_ID");
  const u = new URL(base() + "/oauth/authorize");
  u.searchParams.set("client_id", env.idmeClientId);
  u.searchParams.set("redirect_uri", redirectUri());
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "military");
  u.searchParams.set("state", state);
  return u.toString();
}

export type Verification = "service_member" | "veteran" | "military_spouse" | null;

export async function exchangeAndRead(code: string): Promise<Verification> {
  if (!env.idmeClientId || !env.idmeClientSecret) throw new ConfigError("IDME_CLIENT_ID / IDME_CLIENT_SECRET");
  const tok = await fetch(base() + "/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.idmeClientId,
      client_secret: env.idmeClientSecret,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!tok.ok) throw new Error(`ID.me token exchange failed (${tok.status}).`);
  const { access_token } = (await tok.json()) as { access_token: string };
  const attr = await fetch(base() + "/api/public/v3/attributes.json", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!attr.ok) throw new Error(`ID.me attributes failed (${attr.status}).`);
  const body = (await attr.json()) as { status?: { group: string; subgroups?: string[]; verified: boolean }[] };
  return classify(body.status ?? []);
}

export function classify(status: { group: string; subgroups?: string[]; verified: boolean }[]): Verification {
  const mil = status.find((s) => s.group?.toLowerCase() === "military" && s.verified);
  if (!mil) return null;
  const subs = (mil.subgroups ?? []).map((s) => s.toLowerCase());
  if (subs.some((s) => s.includes("spouse") || s.includes("family"))) return "military_spouse";
  if (subs.some((s) => s.includes("veteran") || s.includes("retiree"))) return "veteran";
  return "service_member";
}
