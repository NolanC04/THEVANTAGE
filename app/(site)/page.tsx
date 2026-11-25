import Link from "next/link";
import { PHASES } from "@/lib/seed";

const P = "/images/paintings/";
const phaseArt = [
  { src: P + "candle-on-stone.jpg", alt: "A single candle burning on a stone in darkness" },
  { src: P + "iron-key-on-marble.jpg", alt: "An ornate iron key resting on dark veined marble" },
  { src: P + "mountain-path-golden-peaks.jpg", alt: "A mountain path winding toward golden peaks" },
];

export default function Home() {
  return (
    <>
      <section className="relative flex flex-col overflow-hidden h-[100svh] min-h-[560px] md:h-auto md:min-h-[920px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero-img absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 40%" }}
          src={P + "ridge-first-light.jpg"}
          alt="Oil painting of a lone figure seated on a ridge, watching first light break over the valley"
          fetchPriority="high"
        />
        <div className="scrim" />
        <div className="hero-copy wrap relative mt-auto pb-14 md:pb-28">
          <p className="eyebrow">The Vantage by Langford</p>
          <h1 className="display mt-5 md:mt-7">Author the life you were built for.</h1>
          <p className="body mt-5 md:mt-7 max-w-[34rem] text-[16px] md:text-[18px]" style={{ color: "var(--color-text)" }}>
            Programs for people in transition who intend to build.
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5 mt-8 md:mt-12">
            <Link className="btn-gold" href="/begin?next=/programs/aapex/1">
              Begin with the free module
            </Link>
            <a href="#phases" className="text-[15px] tracking-[.04em] underline-offset-[6px]" style={{ color: "var(--color-text)" }}>
              See the program
            </a>
          </div>
        </div>
      </section>

      <section className="section wrap max-w-[980px] text-center">
        <p className="quote m-0 text-[clamp(30px,4vw,52px)] leading-[1.25]">Turbulence takes away structure. Structure gives back direction.</p>
        <p className="body mx-auto mt-10 max-w-[34rem]">
          Programs for people in transition who intend to build. Each one is measured, personal, and leaves you a record that&apos;s yours to keep.
        </p>
      </section>

      <section id="phases" aria-labelledby="phases-h" className="wrap pb-[var(--section)]">
        <div className="rule-top flex flex-wrap items-baseline justify-between gap-6 pt-8">
          <h2 id="phases-h" className="h2-sm">AAPEX, in three movements</h2>
          <Link href="/programs/aapex" className="text-[14px] tracking-[.04em]">All twenty-four modules →</Link>
        </div>
        <div className="grid gap-8 mt-14" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}>
          {PHASES.map((ph, i) => (
            <Link key={ph.key} href="/programs/aapex" className="no-underline" style={{ color: "var(--color-text)" }}>
              <div className="frame aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={phaseArt[i].src} alt={phaseArt[i].alt} loading="lazy" />
              </div>
              <p className="eyebrow mt-7">{ph.label}</p>
              <p className="title mt-2.5 mb-0 text-[32px]">{ph.short}</p>
              <p className="body mt-2 mb-0 text-[16px]">{ph.line}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="inside" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center gap-12 md:gap-24 md:pl-0" style={{ paddingRight: "var(--pad-x)" }}>
          <div className="relative flex-[1_1_520px] min-w-0 self-stretch min-h-[360px] md:min-h-[640px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={P + "open-book-quill.jpg"} alt="An open book with a quill resting across its pages" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex-[1_1_400px] min-w-0 py-16 md:py-40" style={{ paddingLeft: "var(--pad-x)" }}>
            <p className="eyebrow">The Library</p>
            <h2 id="inside" className="h2 mt-6">Inside, the program reads you back.</h2>
            <dl className="mt-14 mb-0">
              {[
                ["GENE", "Reads your reasoning, not your answers."],
                ["The Almanac", "A record that compounds, and stays yours."],
                ["The Dome", "What was given to you, and what you chose to build."],
              ].map(([t, d], i) => (
                <div key={t} className={`rule-top py-6 flex flex-wrap gap-6 ${i === 2 ? "border-b border-[var(--color-rule)]" : ""}`}>
                  <dt className="title w-[140px] text-[24px]">{t}</dt>
                  <dd className="body m-0 flex-[1_1_220px] text-[16px]">{d}</dd>
                </div>
              ))}
            </dl>
            <Link href="/library" className="inline-block mt-10 text-[15px] tracking-[.04em]">Step inside a member&apos;s library →</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="ways" className="section wrap">
        <h2 id="ways" className="h2 text-center">Three ways in</h2>
        <div className="grid mt-14 md:mt-[88px] rule-top" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))" }}>
          {[
            { href: "/begin?next=/programs/aapex/1", eyebrow: "Begin", price: "Free", unit: "", line: "The first module, whole.", gold: false },
            { href: "/join", eyebrow: "The Library", price: "$29", unit: "a month", line: "Every program, your guide, your Almanac.", gold: true },
            { href: "/cohort", eyebrow: "The Cohort", price: "$1,200", unit: "", line: "Ten weeks, live, twenty seats.", gold: false },
          ].map((w, i) => (
            <Link
              key={w.eyebrow}
              href={w.href}
              className={`no-underline px-6 md:px-10 py-12 border-b border-[var(--color-rule)] ${i > 0 ? "md:border-l" : ""}`}
              style={{ color: "var(--color-text)" }}
            >
              <p className={`eyebrow ${w.gold ? "" : "eyebrow-dim"}`}>{w.eyebrow}</p>
              <p className="title mt-5 mb-0 text-[40px] font-light">
                {w.price} {w.unit && <span className="text-[20px]" style={{ color: "var(--color-muted)" }}>{w.unit}</span>}
              </p>
              <p className="body mt-3 mb-0 text-[16px]">{w.line}</p>
            </Link>
          ))}
        </div>
        <p className="mt-12 text-center text-[15px]" style={{ color: "var(--color-dim)" }}>
          The inner circle is by invitation. Organizations, <Link href="/organizations">see licensing</Link>.
        </p>
      </section>

      <section aria-label="From the founder" className="relative min-h-[640px] md:min-h-[760px] flex items-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={P + "crag-misted-valley-aqueduct.jpg"} alt="A figure resting on a crag above a misted valley crossed by an aqueduct" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(13,11,8,.35) 0%, rgba(13,11,8,.88) 70%)" }} />
        <div className="wrap relative py-28 flex justify-end">
          <figure className="m-0 max-w-[520px]">
            <blockquote className="quote m-0 text-[clamp(28px,3.2vw,38px)] leading-[1.3]">
              Twice, turbulence took my structure and I drifted. Twice, structure gave me back my direction. Every program here is the system I needed and didn&apos;t have.
            </blockquote>
            <figcaption className="eyebrow mt-8">Nolan Langford · Founder</figcaption>
            <p className="mt-4 mb-0 text-[13px] tracking-[.04em]" style={{ color: "var(--color-muted)" }}>
              Master Resilience Trainer · Resiliency instructor · Builder of 27 programs.
            </p>
          </figure>
        </div>
      </section>

      <section aria-labelledby="proof" className="section wrap">
        <h2 id="proof" className="eyebrow eyebrow-dim">From the people in it</h2>
        <ul className="grid gap-8 mt-10 p-0 list-none" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))" }}>
          {[1, 2, 3].map((n) => (
            <li key={n} className="rule-top pt-8">
              <p className="quote m-0 text-[24px] leading-snug">
                <span className="bracket">[TESTIMONIAL — PENDING MARCH 2027 COHORT]</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Epigraph" className="wrap pb-[var(--section)] text-center">
        <figure className="m-0 mx-auto max-w-[40rem]">
          <blockquote className="quote m-0 text-[clamp(24px,2.6vw,32px)] leading-[1.4]">
            If I am not for myself, who will be for me? If I am only for myself, what am I? And if not now, when?
          </blockquote>
          <figcaption className="mt-6 text-[13px] tracking-[.04em]" style={{ color: "var(--color-dim)" }}>
            Hillel the Elder, Pirkei Avot 1:14
          </figcaption>
        </figure>
      </section>
    </>
  );
}
