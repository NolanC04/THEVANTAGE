import type { Metadata } from "next";
import { ActionForm } from "@/components/ActionForm";

export const metadata: Metadata = { title: "Vantage Licensing", description: "A program that arrives with its evidence. Licensed for your people, delivered by your facilitators." };

const P = "/images/paintings/";

export default function Organizations() {
  return (
    <>
      <section className="relative min-h-[100svh] md:min-h-[820px] flex flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-img absolute inset-0 w-full h-full object-cover" src={P + "leader-before-company.jpg"} alt="A leader in a cloak standing before a gathered company in a dark hall" />
        <div className="scrim" />
        <div className="hero-copy wrap relative mt-auto pb-16 md:pb-28">
          <p className="eyebrow">For organizations · Vantage Licensing</p>
          <h1 className="display mt-6 max-w-[14ch]">A program that arrives with its evidence.</h1>
          <p className="body mt-6 max-w-[34rem]" style={{ color: "var(--color-text)" }}>Licensed for your people, delivered by your facilitators, measured against a comparison group.</p>
          <a className="btn-line mt-8" href="#contact">Request the report</a>
        </div>
      </section>

      <section aria-labelledby="report" className="wrap section grid md:grid-cols-2 gap-16">
        <div>
          <p className="eyebrow">The outcome report</p>
          <h2 id="report" className="h2 mt-6">Three numbers your leadership will ask for.</h2>
          <p className="body mt-6">Measured before, midway, at the end and 90 days after. First pilot data publishes after March 2027.</p>
          <p className="body mt-6 text-[15px]">The licensed program is <strong style={{ color: "var(--color-text)", fontWeight: 400 }}>AAPEX</strong>: twenty-four modules in three movements, delivered by your certified facilitators.</p>
        </div>
        <dl className="m-0">
          {["Change against a comparison group", "Completion rate", "Cost per participant"].map((t, i) => (
            <div key={t} className={`rule-top py-7 flex flex-wrap justify-between gap-4 ${i === 2 ? "border-b border-[var(--color-rule)]" : ""}`}>
              <dt className="body m-0">{t}</dt>
              <dd className="title text-[32px] m-0 bracket">[ — ]</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="path" style={{ background: "var(--color-surface)" }}>
        <div className="wrap section">
          <h2 id="path" className="h2">From first call to license</h2>
          <ol className="grid gap-10 mt-16 p-0 list-none" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}>
            {[
              ["I", "Conversation", "Your people, your outcome, the right program."],
              ["II", "Pilot", "Twenty seats and a comparison group, measured."],
              ["III", "Report", "Ninety-day outcomes and a recommendation."],
              ["IV", "License", "Your certified facilitators run it, with our materials."],
            ].map(([n, t, d]) => (
              <li key={n} className="rule-top pt-8">
                <p className="title text-[28px] m-0" style={{ color: "var(--color-gold)" }}>{n}</p>
                <p className="title text-[28px] mt-3 mb-0">{t}</p>
                <p className="body mt-3 text-[16px]">{d}</p>
              </li>
            ))}
          </ol>
          <p className="title text-[32px] font-light mt-16 mb-0">
            $5,000 – $15,000 <span className="text-[16px]" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>per site, per year · pilot sites receive founding terms</span>
          </p>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-h" className="wrap section grid md:grid-cols-[1fr_1.3fr] gap-16">
        <div>
          <h2 id="contact-h" className="h2">Request the outcome report</h2>
          <p className="body mt-6">We&apos;ll send the latest report, and a time to talk if it fits.</p>
        </div>
        <ActionForm
          endpoint="/api/organizations/inquiry"
          columns={2}
          submit="Send request"
          success="Received. Nolan reads every request and will reply."
          fields={[
            { name: "name", label: "Your name", autoComplete: "name" },
            { name: "organization", label: "Organization", autoComplete: "organization" },
            { name: "work_email", label: "Work email", type: "email", autoComplete: "email" },
            { name: "outcome", label: "The outcome that matters most", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}
