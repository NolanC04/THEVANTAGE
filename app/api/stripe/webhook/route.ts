import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { store } from "@/lib/store";
import { env } from "@/lib/env";
import { ok, bad, fail } from "@/lib/api";
import type { Member } from "@/lib/types";

// Stripe is the source of truth for tier. Every change arrives here, signature-verified.
export async function POST(req: Request) {
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, req.headers.get("stripe-signature") ?? "", env.stripeWebhookSecret);
  } catch {
    return bad("Invalid signature.", 400);
  }
  try {
    const db = store();
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const member_id = s.metadata?.member_id;
      const kind = s.metadata?.kind as "library" | "cohort" | undefined;
      if (member_id && kind && s.payment_status !== "unpaid") {
        await db.upsert("purchases", { member_id, kind, stripe_session_id: s.id, cohort_id: s.metadata?.cohort_id ?? null, amount_cents: s.amount_total, status: "paid" }, "stripe_session_id");
        const patch: Partial<Member> = kind === "cohort" ? { tier: "cohort" } : { tier: "library", subscription_status: "active" };
        const m = await db.get<Member>("members", { id: member_id });
        if (m && !(kind === "library" && m.tier === "cohort")) await db.update("members", { id: member_id }, patch);
      }
    }
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const member = await db.get<Member>("members", { stripe_customer_id: String(sub.customer) });
      if (member) {
        const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;
        const patch: Partial<Member> = { subscription_status: status };
        if (member.tier === "library" && !["active", "trialing"].includes(status)) patch.tier = member.verified_military ? "military" : "free";
        if (member.tier !== "cohort" && ["active", "trialing"].includes(status)) patch.tier = "library";
        await db.update("members", { id: member.id }, patch);
      }
    }
    if (event.type === "charge.refunded") {
      const ch = event.data.object as Stripe.Charge;
      if (ch.payment_intent) {
        const sessions = await stripe().checkout.sessions.list({ payment_intent: String(ch.payment_intent), limit: 1 });
        const sid = sessions.data[0]?.id;
        if (sid) await db.update("purchases", { stripe_session_id: sid }, { status: "refunded" });
      }
    }
    return ok({ received: true });
  } catch (e) {
    return fail(e); // non-2xx → Stripe retries
  }
}
