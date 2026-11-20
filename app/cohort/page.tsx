import Link from "next/link";
import type { Metadata } from "next";
import { currentCohort, seatsTaken } from "@/lib/content";
import { ActionForm } from "@/components/ActionForm";

export const metadata: Metadata = { title: "The Cohort", description: "Do the hard work among people. Ten weeks, live, twenty seats." };
export const dynamic = "force-dynamic";

const P = "/images/paintings/";
const fmt = (d: string | null) => (d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null);

export default async function CohortPage() {
  const cohort = await currentCohort();
  const taken = cohort ? await seatsTaken(cohort.id) : 0;
  const left = cohort ? Math.max(cohort.seats - taken, 0) : 0;
  return (
    <>
      <section className="relative min-h-[100svh] md:min-h-[860px] flex flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-img absolute inset-0 w-full h-full object-cover" src={P + "circle-planting-seedling.jpg"} alt="A circle of people kneeling together around a seedling in the earth" />
        <div className="scrim" />
        <div className="hero-copy wrap relative mt-auto pb-16 md:pb-28 flex flex-wrap items-end justify-between gap-10">
          <div>
            <p className="eyebrow">The Cohort · Twenty seats</p>
            <h1 className="display mt-6">Do the hard work among people.</h1>
          </div>
          <div>
            <p className="title text-[48px] font-light m-0">$1,200</p>
            <p className="mt-2 text-[15px]" style={{ color: "var(--color-muted)" }}>
              Founding members $900 · Starts {fmt(cohort?.starts_on ?? null) ?? <span className="bracket">[date]</span>}
            </p>
            {cohort && <p className="mt-1 text-[14px]" style={{ color: "var(--color-dim)" }}>{left} of {cohort.seats} seats open</p>}
            <a className="btn-gold mt-6" href="#apply">Apply for a seat</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="arc" className="wrap section">
        <h2 id="arc" className="h2">Ten weeks, three movements</h2>
        <ol className="grid gap-10 mt-16 p-0 list-none" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))" }}>
          {[
            ["Weeks 1 – 3", "Hold steady", "Find where you stand, name what pulled you off course, set the standard you'll keep."],
            ["Weeks 4 – 7", "Act with intent", "Decisions under pressure, difficult conversations, small trials you can win."],
            ["Weeks 8 – 10", "Build across your life", "A real project shipped, and your Almanac sealed at graduation."],
          ].map(([w, t, d]) => (
            <li key={w} className="rule-top pt-8">
              <p className="eyebrow">{w}</p>
              <p className="title text-[32px] mt-4 mb-0">{t}</p>
              <p className="body mt-3 text-[16px]">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-16 text-[16px]" style={{ color: "var(--color-muted)" }}>
          Not sure yet? Join a free 30-minute info session, {fmt(cohort?.info_session_on ?? null) ?? <span className="bracket">[next date]</span>}. <a href="#apply">Save a spot</a>
        </p>
      </section>

      <section id="apply" aria-labelledby="apply-h" style={{ background: "var(--color-surface)" }}>
        <div className="wrap section grid md:grid-cols-[1fr_1.3fr] gap-16">
          <div>
            <h2 id="apply-h" className="h2">Apply in five minutes</h2>
            <p className="body mt-6 max-w-[26rem]">An answer within a week, and no sales call. If it isn&apos;t the right time, we&apos;ll tell you what is.</p>
          </div>
          <ActionForm
            endpoint="/api/cohort/apply"
            columns={2}
            submit="Send application"
            success="Application received. You'll have an answer within a week."
            fields={[
              { name: "full_name", label: "Full name", autoComplete: "name" },
              { name: "email", label: "Email", type: "email", autoComplete: "email" },
              { name: "where_now", label: "Where you are now", type: "select", options: ["Separating from the military within a year", "Veteran", "Civilian, building something", "Between chapters"] },
              { name: "intends_to_build", label: "What you intend to build", type: "textarea" },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="faq" className="wrap section max-w-[920px]">
        <h2 id="faq" className="h2-sm">Questions</h2>
        <div className="mt-10">
          {[
            ["Is this therapy or coaching?", <>Neither. It&apos;s a structured education program, and we refer you to the right support if you need it.</>],
            ["What if I miss a session?", <>Recordings post within a day. Certification requires <span className="bracket">[attendance standard]</span>.</>],
            ["What's the refund policy?", <span key="r" className="bracket">[Refund policy]</span>],
          ].map(([q, a]) => (
            <details key={String(q)} className="rule-top py-6">
              <summary className="title text-[24px]">{q}</summary>
              <p className="body mt-4 mb-0">{a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-[14px]" style={{ color: "var(--color-dim)" }}>Already applied and accepted? <Link href="/account">Reserve your seat from your account</Link>.</p>
      </section>
    </>
  );
}
