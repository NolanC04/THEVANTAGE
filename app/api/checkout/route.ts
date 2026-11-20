import { currentMember } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { currentCohort, seatsTaken } from "@/lib/content";
import { store } from "@/lib/store";
import { env, ConfigError } from "@/lib/env";
import { ok, bad, fail } from "@/lib/api";
import type { Member } from "@/lib/types";

async function customerFor(m: Member) {
  if (m.stripe_customer_id) return m.stripe_customer_id;
  const c = await stripe().customers.create({ email: m.email, metadata: { member_id: m.id } });
  await store().update("members", { id: m.id }, { stripe_customer_id: c.id });
  return c.id;
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    const member = await currentMember();
    if (!member) return bad("Sign in first.", 401);
    const customer = await customerFor(member);
    const discounts = member.spouse_discount && env.couponSpouse ? [{ coupon: env.couponSpouse }] : undefined;

    if (plan === "library") {
      if (!env.priceLibrary) throw new ConfigError("STRIPE_PRICE_LIBRARY_MONTHLY");
      const s = await stripe().checkout.sessions.create({
        mode: "subscription",
        customer,
        line_items: [{ price: env.priceLibrary, quantity: 1 }],
        discounts,
        success_url: `${env.siteUrl}/account?joined=library`,
        cancel_url: `${env.siteUrl}/join`,
        metadata: { member_id: member.id, kind: "library" },
        subscription_data: { metadata: { member_id: member.id } },
      });
      return ok({ url: s.url });
    }

    if (plan === "cohort" || plan === "cohort_founding") {
      const price = plan === "cohort_founding" ? env.priceCohortFounding : env.priceCohort;
      if (!price) throw new ConfigError(plan === "cohort_founding" ? "STRIPE_PRICE_COHORT_FOUNDING" : "STRIPE_PRICE_COHORT");
      const cohort = await currentCohort();
      if (!cohort) return bad("No cohort is open right now.", 409);
      if ((await seatsTaken(cohort.id)) >= cohort.seats) return bad("All twenty seats are taken. Apply for the next cohort.", 409);
      const s = await stripe().checkout.sessions.create({
        mode: "payment",
        customer,
        line_items: [{ price, quantity: 1 }],
        discounts,
        success_url: `${env.siteUrl}/account?joined=cohort`,
        cancel_url: `${env.siteUrl}/cohort`,
        metadata: { member_id: member.id, kind: "cohort", cohort_id: cohort.id },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });
      return ok({ url: s.url });
    }
    return bad("Unknown plan.");
  } catch (e) {
    return fail(e);
  }
}
