import { cookies } from "next/headers";
import { devAuth, devSignIn, currentProfile, homeOf } from "@/lib/airman/auth";
import { sendMagicLink } from "@/lib/supabase-magic-link";
import { store } from "@/lib/airman/store";
import { env } from "@/lib/airman/env";
import { ok, bad, fail, isEmail, str } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!isEmail(b.email)) return bad("That email doesn't look complete.");
    const email = b.email.trim().toLowerCase();
    const code = str(b.code, 12).toUpperCase();
    const jar = await cookies();
    if (!b.returning) {
      if (!b.consent) return bad("Check the box to continue.");
      const invite = await store().get("invites", { code, active: true });
      const envAdmin = env.adminEmail && email === env.adminEmail;
      if (!invite && !envAdmin) return bad("That invite code isn't active. Check it with your facilitator.", 404);
      jar.set("apex_invite", code, { httpOnly: true, sameSite: "lax", maxAge: 3600, path: "/" });
      jar.set("apex_consent", "1", { httpOnly: true, sameSite: "lax", maxAge: 3600, path: "/" });
    }
    if (devAuth()) {
      await devSignIn(email);
      const p = await currentProfile();
      if (!p) return bad("That account isn't set up yet. Ask your facilitator for an invite code.", 403);
      return ok({ redirect: homeOf(p.role) });
    }
    // The invite and consent also ride on the account itself, so a link opened in another browser still finds them.
    const data = !b.returning ? { apex_invite: code, apex_consent: "1" } : undefined;
    await sendMagicLink(email, `${env.siteUrl}/airman/auth/confirm`, data);
    return ok({ sent: true });
  } catch (e) {
    return fail(e);
  }
}
