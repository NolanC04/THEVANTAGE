import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { programBySlug, tracklist } from "@/lib/content";
import { PHASES } from "@/lib/seed";
import type { Module } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await programBySlug((await params).slug);
  if (!p || p.status !== "published") notFound();
  return { title: p.word, description: p.thesis ?? undefined, openGraph: { images: p.cover_url ? [p.cover_url] : [] } };
}

function Tile({ slug, m }: { slug: string; m: Module }) {
  return (
    <Link href={`/programs/${slug}/${m.number}`} className="group no-underline" style={{ color: "var(--color-text)" }}>
      {m.cover_url ? (
        <div className="frame aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.cover_url} alt={m.cover_alt ?? ""} loading="lazy" />
        </div>
      ) : (
        <div className="aspect-[4/3] flex flex-col items-center justify-center gap-3 border border-[var(--color-gold)]" style={{ background: "var(--color-surface)" }}>
          <span className="title text-[56px] font-light" style={{ color: "var(--color-gold)" }}>I</span>
          <span className="eyebrow text-[11px]">Free lead single</span>
        </div>
      )}
      <p className="mt-[18px] mb-0 text-[12px] tracking-[.24em]" style={{ color: "var(--color-dim)" }}>{String(m.number).padStart(2, "0")}</p>
      <p className="title mt-1.5 mb-0 text-[24px] group-hover:text-[var(--color-gold)]">{m.title}</p>
    </Link>
  );
}

export default async function ProgramAlbum({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await programBySlug(slug);
  if (!program || program.status !== "published") notFound();
  const tracks = await tracklist(program.id);
  const grouped = program.slug === "aapex" ? PHASES.map((ph) => ({ ph, list: tracks.filter((t) => t.phase === ph.key) })) : [{ ph: null, list: tracks }];

  return (
    <>
      <section className="relative min-h-[100svh] md:min-h-[760px] flex items-end overflow-hidden">
        {program.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero-img absolute inset-0 w-full h-full object-cover" src={program.cover_url} alt={program.cover_alt ?? ""} />
        )}
        <div className="scrim" />
        <div className="hero-copy wrap relative pb-16 md:pb-28">
          <p className="eyebrow">{program.release_label}</p>
          <h1 className="display mt-6">{program.word}</h1>
          <p className="title text-[clamp(24px,2.6vw,32px)] mt-6 mb-0">{program.thesis}</p>
          {program.tagline && <p className="body mt-4 max-w-[32rem]">{program.tagline}</p>}
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5 mt-10">
            <Link className="btn-gold" href={`/begin?next=/programs/${program.slug}/1`}>Begin Module 01, free</Link>
            <Link href="/cohort" style={{ color: "var(--color-text)" }}>Take it live</Link>
          </div>
          {program.military_free && (
            <p className="mt-8 mb-0 text-[14px]" style={{ color: "var(--color-muted)" }}>
              Free for active duty service members and veterans. <Link href="/military">Verify your service</Link>.
            </p>
          )}
        </div>
      </section>

      {grouped.map(({ ph, list }) => (
        <section key={ph?.key ?? "all"} aria-labelledby={`ph-${ph?.key ?? "all"}`} className="wrap pt-[var(--section)]">
          <div className="rule-top flex flex-wrap items-baseline gap-x-8 gap-y-4 pt-7">
            {ph && <p className="eyebrow">{ph.label}</p>}
            <h2 id={`ph-${ph?.key ?? "all"}`} className="h2-sm">{ph?.name ?? "Tracklist"}</h2>
          </div>
          <div className="grid gap-x-8 gap-y-14 mt-14" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
            {list.map((m) => <Tile key={m.id} slug={program.slug} m={m} />)}
          </div>
        </section>
      ))}
      <div className="pb-[var(--section)]" />
    </>
  );
}
