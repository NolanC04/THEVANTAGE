import Link from "next/link";
import type { Metadata } from "next";
import { currentMember } from "@/lib/auth";

export const metadata: Metadata = { title: "Military and veterans", description: "AAPEX is free for active duty service members and veterans." };
export const dynamic = "force-dynamic";

const MSG: Record<string, string> = {
  service_member: "Verified. AAPEX is open to you, free.",
  veteran: "Verified. AAPEX is open to you, free.",
  military_spouse: "Verified as a military spouse. Your discount applies at checkout.",
};
const ERR: Record<string, string> = {
  not_configured: "Verification isn't switched on yet. Try again soon.",
  not_verified: "ID.me didn't return a verified military status. Nothing was stored.",
  failed: "Verification didn't complete. Nothing was stored. Try again.",
};

export default async function Military({ searchParams }: { searchParams: Promise<{ verified?: string; error?: string }> }) {
  const sp = await searchParams;
  const m = await currentMember();
  return (
    <section className="wrap pt-[150px] pb-[var(--section)] max-w-[880px]">
      <p className="eyebrow">Active duty and veterans</p>
      <h1 className="h2 mt-6">AAPEX is free for those who serve and have served.</h1>
      <p className="body mt-8">
        Verify once through ID.me. We receive a yes or no and the type of status, nothing else. We never see, collect or store an ID, a document or a photo.
      </p>
      <p className="body mt-4">Military spouses receive a discount on the Library and the Cohort: <span className="bracket">[NOLAN: amount]</span>.</p>
      {sp.verified && MSG[sp.verified] && <p role="status" className="title text-[26px] mt-10">{MSG[sp.verified]}</p>}
      {sp.error && ERR[sp.error] && <p role="alert" className="error mt-10">{ERR[sp.error]}</p>}
      <div className="mt-10">
        {!m ? (
          <Link className="btn-gold" href="/begin?next=/military">Begin with your email</Link>
        ) : m.verification_type ? (
          <Link className="btn-gold" href="/programs/aapex">Open AAPEX</Link>
        ) : (
          <a className="btn-gold" href="/api/verify/idme/start">{sp.error ? "Retry with ID.me" : "Verify with ID.me"}</a>
        )}
      </div>
      <p className="mt-12 text-[13px]" style={{ color: "var(--color-dim)" }}>
        The Vantage is an independent educational program. Service is mentioned as plain fact; nothing here implies endorsement by the Department of Defense or any branch.
      </p>
    </section>
  );
}
