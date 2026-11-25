import { currentMember } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { ok, bad, fail } from "@/lib/api";

export async function POST() {
  try {
    const member = await currentMember();
    if (!member) return bad("Sign in first.", 401);
    if (!member.stripe_customer_id) return bad("No billing account yet.", 409);
    const s = await stripe().billingPortal.sessions.create({ customer: member.stripe_customer_id, return_url: `${env.siteUrl}/account` });
    return ok({ url: s.url });
  } catch (e) {
    return fail(e);
  }
}
