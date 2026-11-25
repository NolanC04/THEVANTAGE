import Link from "next/link";
import { notFound } from "next/navigation";
import { programBySlug, moduleOf } from "@/lib/content";
import { currentMember, isAdmin } from "@/lib/auth";
import { moduleGate } from "@/lib/access";
import { phaseFor } from "@/lib/seed";
import { renderMarkdown } from "@/lib/markdown";
import { store } from "@/lib/store";
import type { AlmanacEntry } from "@/lib/types";
import { GeneAsks } from "@/components/GeneAsks";
import { FrameworkShelf } from "@/components/frameworks/FrameworkCard";
import { frameworksForModule } from "@/lib/frameworks/registry";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const program = await programBySlug(slug);
  const number = Number(n);
  if (!program || !Number.isInteger(number)) notFound();
  const mod = await moduleOf(program.id, number);
  if (!mod) notFound();
  const member = await currentMember();
  const gate = moduleGate(member, program, mod);
  if (!gate.open && gate.reason === "draft") notFound();
  const ph = program.slug === "aapex" ? phaseFor(number) : null;
  const eyebrow = `${ph ? `${ph.label} · ` : ""}Module ${String(number).padStart(2, "0")}`;

  if (!gate.open) {
    return (
      <section className="wrap pt-[150px] pb-[var(--section)] max-w-[760px]">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h2 mt-6">{mod.title}</h1>
        {gate.reason === "sign_in" ? (
          <>
            <p className="body mt-8">Sign in with your email to open this module. No card.</p>
            <Link className="btn-gold mt-8" href={`/begin?next=/programs/${slug}/${number}`}>Begin with your email</Link>
          </>
        ) : (
          <>
            <p className="body mt-8">This module is part of The Vantage Library.</p>
            <div className="flex flex-wrap gap-6 mt-8 items-center">
              <Link className="btn-gold" href="/join">Join the library, $29 a month</Link>
              {program.military_free && <Link href="/military">Serving or a veteran? It&apos;s free.</Link>}
            </div>
          </>
        )}
      </section>
    );
  }

  const admin = isAdmin(member);
  const practice = slug === "aapex" ? frameworksForModule(number, admin) : [];
  const sealed = member ? await store().get<AlmanacEntry>("almanac_entries", { member_id: member.id, program_slug: slug, module_number: number }) : null;

  return (
    <>
      <section className="relative min-h-[70svh] md:min-h-[560px] flex items-end overflow-hidden">
        {mod.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mod.cover_url} alt={mod.cover_alt ?? ""} className="hero-img absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(13,11,8,.55) 0%, rgba(13,11,8,0) 35%, rgba(13,11,8,.95) 100%)" }} />
        <div className="wrap relative pb-14 pt-[140px]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="h2 mt-5 max-w-[16ch]" style={{ fontSize: "clamp(40px,5vw,72px)" }}>{mod.title}</h1>
          {mod.minutes && <p className="mt-6 text-[15px]" style={{ color: "var(--color-muted)" }}>Lesson · {mod.minutes} min</p>}
        </div>
      </section>
      <article className="wrap max-w-[920px] py-20 prose-v">
        {mod.body_md ? (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(mod.body_md) }} />
        ) : (
          <p><span className="bracket">[NOLAN: Module {number} lesson arrives as an approved Studiolo release]</span></p>
        )}
      </article>
      {practice.length > 0 && (
        <section className="wrap max-w-[920px] pb-20" aria-label="Practice">
          <FrameworkShelf frameworks={practice} admin={admin} eyebrowClass="eyebrow" />
        </section>
      )}
      <section className="wrap max-w-[920px] pb-[var(--section)]">
        <GeneAsks
          programSlug={slug}
          moduleNumber={number}
          question={mod.gene_question}
          sealed={sealed ? { answer: sealed.answer, reply: sealed.gene_reply } : null}
        />
        <div className="rule-top mt-20 pt-8 flex justify-between text-[15px]">
          {number > 1 ? <Link href={`/programs/${slug}/${number - 1}`}>← Module {number - 1}</Link> : <span />}
          <Link href={`/programs/${slug}`}>Tracklist</Link>
          <Link href={`/programs/${slug}/${number + 1}`}>Module {number + 1} →</Link>
        </div>
      </section>
    </>
  );
}
