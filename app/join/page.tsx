import Link from "next/link";
import type { Metadata } from "next";
import { currentMember } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/access";
import { PostButton } from "@/components/PostButton";
import { stripeTestMode } from "@/lib/stripe";

export const metadata: Metadata = { title: "The Vantage Library", description: "Every program, your guide, your Almanac. $29 a month." };
export const dynamic = "force-dynamic";

export default async function Join() {
  const m = await currentMember();
  return (
    <section className="wrap pt-[150px] pb-[var(--section)] max-w-[880px]">
      <p className="eyebrow">The Library · $29 a month</p>
      <h1 className="h2 mt-6">Every program, your guide, your Almanac.</h1>
      <ul className="body mt-10 pl-5">
        <li>Every released program, module by module.</li>
        <li>GENE reads your reasoning on each module.</li>
        <li>Your Almanac, private to you, carried across every release.</li>
        <li>Cancel any time from your account.</li>
      </ul>
      <div className="mt-12">
        {!m ? (
          <Link className="btn-gold" href="/begin?next=/join">Begin with your email</Link>
        ) : hasPaidAccess(m) ? (
          <p className="title text-[26px]">You&apos;re in. <Link href="/account">Open your library</Link>.</p>
        ) : (
          <PostButton endpoint="/api/checkout" body={{ plan: "library" }} label="Join the library" />
        )}
      </div>
      {m?.spouse_discount && <p className="mt-6 text-[14px]" style={{ color: "var(--color-muted)" }}>Your military spouse discount applies at checkout.</p>}
      <p className="mt-10 text-[14px]" style={{ color: "var(--color-dim)" }}>
        Serving or a veteran? AAPEX is free. <Link href="/military">Verify your service</Link>.
        {stripeTestMode() && " · Payments are in test mode."}
      </p>
    </section>
  );
}
