import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentMember } from "@/lib/auth";
import { hasPaidAccess, moduleGate } from "@/lib/access";
import { programBySlug, tracklist, purchasesOf, currentCohort, seatsTaken } from "@/lib/content";
import { store } from "@/lib/store";
import { phaseFor } from "@/lib/seed";
import type { AlmanacEntry, DomeRow } from "@/lib/types";
import { DomeEditor } from "@/components/DomeEditor";
import { PostButton } from "@/components/PostButton";

export const metadata: Metadata = { title: "Your library", robots: { index: false } };
export const dynamic = "force-dynamic";

const TIER_LABEL = { free: "Begin (free)", library: "The Vantage Library", cohort: "The Vantage Cohort", military: "Military and veteran access" } as const;

export default async function Account() {
  const member = await currentMember();
  if (!member) redirect("/begin?next=/account");
  const db = store();
  const program = await programBySlug("aapex");
  const [tracks, sealed, domeRow, purchases, cohort] = await Promise.all([
    program ? tracklist(program.id) : Promise.resolve([]),
    // Almanac: only the signed-in member's own entries (RLS enforces the same on direct API access).
    db.list<AlmanacEntry>("almanac_entries", { member_id: member.id }),
    db.get<DomeRow>("dome", { member_id: member.id }),
    purchasesOf(member.id),
    currentCohort(),
  ]);
  const seats = cohort ? cohort.seats - (await seatsTaken(cohort.id)) : 0;
  const sealedSet = new Set(sealed.filter((s) => s.program_slug === "aapex").map((s) => s.module_number));
  const current = tracks.find((t) => !sealedSet.has(t.number) && program && moduleGate(member, program, t).open) ?? null;

  return (
    <div className="flex flex-wrap pt-[100px] md:pt-[120px]">
      <aside className="flex-[1_1_220px] md:max-w-[280px] md:border-r border-[var(--color-rule-faint)] px-5 md:px-9 py-6 md:py-10">
        <nav aria-label="Library" className="flex md:flex-col flex-wrap gap-x-6 gap-y-1 text-[15px]">
          {[["#today", "Today"], ["/programs", "Programs"], ["#almanac", "My Almanac"], ["#dome", "The Dome"], ["/cohort", "Cohorts"], ["#membership", "Membership"]].map(([h, l]) => (
            <Link key={h} href={h} className="py-2.5 no-underline" style={{ color: "var(--color-muted)" }}>{l}</Link>
          ))}
        </nav>
        <p className="mt-10 text-[12px] tracking-[.24em] uppercase" style={{ color: "var(--color-dim)" }}>{member.email}</p>
        <form action="/api/auth/signout" method="post" className="mt-3">
          <button className="text-[13px] underline bg-transparent border-0 p-0 cursor-pointer" style={{ color: "var(--color-dim)" }}>Sign out</button>
        </form>
      </aside>

      <div className="flex-[999_1_640px] min-w-0">
        <section id="today" aria-labelledby="today-h" className="relative min-h-[420px] md:min-h-[560px] flex items-end overflow-hidden">
          {current?.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.cover_url} alt={current.cover_alt ?? ""} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(13,11,8,0) 35%, rgba(13,11,8,.95) 100%)" }} />
          <div className="relative px-5 md:px-[72px] pb-12 md:pb-16">
            {current ? (
              <>
                <p className="eyebrow">{phaseFor(current.number).label} · Module {current.number}</p>
                <h1 id="today-h" className="title font-light text-[clamp(40px,5vw,72px)] leading-none mt-5 mb-0 max-w-[16ch]">{current.title}</h1>
                <Link href={`/programs/aapex/${current.number}`} className="btn-gold mt-8">Continue</Link>
              </>
            ) : (
              <>
                <p className="eyebrow">Today</p>
                <h1 id="today-h" className="title font-light text-[clamp(36px,4vw,56px)] leading-tight mt-5 mb-0 max-w-[20ch]">
                  {hasPaidAccess(member) || member.verified_military ? "Every open module is sealed." : "Module 01 is yours. The rest opens with the Library."}
                </h1>
                <Link href={hasPaidAccess(member) || member.verified_military ? "/programs" : "/join"} className="btn-gold mt-8">
                  {hasPaidAccess(member) || member.verified_military ? "See all programs" : "Join the library"}
                </Link>
              </>
            )}
          </div>
        </section>

        <section id="almanac" aria-labelledby="alm-h" className="px-5 md:px-[72px] py-20 md:py-[120px]">
          <div className="rule-top pt-7 flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="alm-h" className="h2-sm">My Almanac</h2>
            <p className="m-0 text-[14px]" style={{ color: "var(--color-muted)" }}>{sealedSet.size} of {tracks.length} modules sealed</p>
          </div>
          <div className="grid gap-3 mt-10" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(120px, 30%), 1fr))" }}>
            {tracks.map((t) =>
              sealedSet.has(t.number) && t.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={t.id} src={t.cover_url} alt={`Module ${t.number} sealed`} className="aspect-[4/3] w-full object-cover" />
              ) : sealedSet.has(t.number) ? (
                <div key={t.id} className="aspect-[4/3] flex items-center justify-center title text-[28px]" style={{ background: "var(--color-surface)", color: "var(--color-gold)" }}>I</div>
              ) : current?.number === t.number ? (
                <div key={t.id} className="aspect-[4/3] flex items-center justify-center border border-[var(--color-gold)] text-[12px] tracking-[.2em]" style={{ color: "var(--color-gold)" }}>{t.number} · NOW</div>
              ) : (
                <div key={t.id} className="aspect-[4/3] flex items-center justify-center border border-[var(--color-rule)] text-[13px]" style={{ color: "var(--color-dim)" }}>{t.number}</div>
              ),
            )}
          </div>
          {sealed.length > 0 && (
            <ol className="mt-14 p-0 list-none">
              {sealed.sort((a, b) => a.module_number - b.module_number).map((s) => (
                <li key={s.id} className="rule-top py-6">
                  <p className="eyebrow text-[11px]">Module {s.module_number} · sealed {new Date(s.sealed_at).toLocaleDateString()}</p>
                  <p className="title text-[22px] mt-3 mb-0">{s.question}</p>
                  <p className="body mt-2 mb-0 text-[15px]">{s.answer}</p>
                  <p className="mt-3 mb-0 pl-4 border-l border-[var(--color-gold)] text-[15px]">{s.gene_reply}</p>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-8 text-[13px]" style={{ color: "var(--color-dim)" }}>Your Almanac is private. No one else can read it.</p>
        </section>

        <section id="dome" aria-labelledby="dome-h" className="px-5 md:px-[72px] pb-20 md:pb-[120px]">
          <div className="rule-top pt-7"><h2 id="dome-h" className="h2-sm">The Dome</h2></div>
          <DomeEditor given={domeRow?.given ?? []} chosen={domeRow?.chosen ?? []} />
        </section>

        <section id="membership" aria-labelledby="mem-h" className="px-5 md:px-[72px] pb-20 md:pb-[120px]">
          <div className="rule-top pt-7"><h2 id="mem-h" className="h2-sm">Membership</h2></div>
          <dl className="mt-8 grid md:grid-cols-[220px_1fr] gap-x-8 gap-y-4 text-[15px]">
            <dt style={{ color: "var(--color-dim)" }}>Tier</dt>
            <dd className="m-0">{TIER_LABEL[member.tier]}{member.subscription_status && member.tier === "library" ? ` · ${member.subscription_status}` : ""}</dd>
            <dt style={{ color: "var(--color-dim)" }}>Service verification</dt>
            <dd className="m-0">
              {member.verification_type ? `Verified (${member.verification_type.replace("_", " ")})` : <Link href="/military">Not verified · verify for free AAPEX</Link>}
            </dd>
          </dl>
          <div className="flex flex-wrap gap-6 mt-10">
            {!hasPaidAccess(member) && <PostButton endpoint="/api/checkout" body={{ plan: "library" }} label="Join the library, $29 a month" />}
            {member.stripe_customer_id && <PostButton endpoint="/api/billing/portal" label="Manage billing" variant="line" />}
          </div>
          {cohort && member.tier !== "cohort" && (
            <div className="mt-12">
              <p className="eyebrow">An invitation from your Almanac</p>
              <p className="title text-[28px] mt-3 mb-2">Do the hard modules live, with people.</p>
              <p className="text-[14px] mb-6" style={{ color: "var(--color-muted)" }}>{seats} of {cohort.seats} seats open. Accepted applicants reserve here.</p>
              <div className="flex flex-wrap gap-6">
                <PostButton endpoint="/api/checkout" body={{ plan: "cohort" }} label="Reserve a seat, $1,200" variant="line" />
                <PostButton endpoint="/api/checkout" body={{ plan: "cohort_founding" }} label="Founding member, $900" variant="line" />
              </div>
            </div>
          )}
          {purchases.length > 0 && (
            <>
              <h3 className="eyebrow mt-14">Purchases</h3>
              <ul className="mt-4 p-0 list-none text-[15px]">
                {purchases.map((p) => (
                  <li key={p.id} className="rule-top py-3 flex justify-between gap-4">
                    <span>{p.kind === "library" ? "The Vantage Library" : "The Vantage Cohort"}{p.status === "refunded" ? " · refunded" : ""}</span>
                    <span style={{ color: "var(--color-dim)" }}>{p.amount_cents != null ? `$${(p.amount_cents / 100).toFixed(2)}` : ""} · {new Date(p.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
