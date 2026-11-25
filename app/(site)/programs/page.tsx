import Link from "next/link";
import type { Metadata } from "next";
import { publishedPrograms, allPrograms } from "@/lib/content";
import { FAMILIES } from "@/lib/types";

export const metadata: Metadata = { title: "Programs", description: "Every program as an album: one word, a tracklist of modules, and an Almanac that carries across all of them." };
export const dynamic = "force-dynamic";

export default async function ProgramsIndex() {
  const [published, all] = await Promise.all([publishedPrograms(), allPrograms()]);
  const flagship = published.filter((p) => !p.family);
  const upcoming = all.filter((p) => p.status === "draft" && p.release_label);
  return (
    <div className="pt-[120px] md:pt-[150px]">
      <section className="wrap">
        <p className="eyebrow">The programs</p>
        <h1 className="display mt-6 max-w-[14ch]" style={{ fontSize: "clamp(44px,6vw,88px)" }}>Each one a word. Each word an album.</h1>
        <p className="body mt-8 max-w-[36rem]">A program is an album and its modules are the tracklist. Your Almanac is the liner notes, and it carries across every release.</p>
      </section>

      {flagship.map((p) => (
        <section key={p.id} className="wrap mt-24">
          <Link href={`/programs/${p.slug}`} className="no-underline grid md:grid-cols-2 gap-10 items-end" style={{ color: "var(--color-text)" }}>
            <div className="frame aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.cover_url && <img src={p.cover_url} alt={p.cover_alt ?? ""} />}
            </div>
            <div>
              <p className="eyebrow">{p.release_label}</p>
              <h2 className="title text-[clamp(56px,7vw,96px)] font-light m-0 mt-4 leading-none">{p.word}</h2>
              <p className="body mt-5">{p.thesis}</p>
              <span className="inline-block mt-6 text-[15px]" style={{ color: "var(--color-gold)" }}>See the tracklist →</span>
            </div>
          </Link>
        </section>
      ))}

      <section className="wrap section" aria-labelledby="fam">
        <h2 id="fam" className="h2-sm">Five families</h2>
        <div className="mt-12">
          {FAMILIES.map((fam) => {
            const list = published.filter((p) => p.family === fam);
            return (
              <div key={fam} className="rule-top py-8 grid md:grid-cols-[280px_1fr] gap-4">
                <p className="title text-[28px] m-0">{fam}</p>
                {list.length ? (
                  <ul className="m-0 p-0 list-none flex flex-wrap gap-x-8 gap-y-3">
                    {list.map((p) => (
                      <li key={p.id}><Link href={`/programs/${p.slug}`}>{p.word}</Link></li>
                    ))}
                  </ul>
                ) : (
                  <p className="body m-0 text-[15px]">Releases in this family are in the studio.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {upcoming.map((p) => (
        <section key={p.id} className="wrap pb-[var(--section)]">
          <div className="rule-top pt-10 flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="eyebrow eyebrow-dim">{p.release_label?.replace("[NOLAN: release date]", "[Release date]")}</p>
              <h2 className="title text-[48px] font-light m-0 mt-3">{p.word}</h2>
            </div>
            <div className="max-w-[360px]">
              <p className="body m-0 text-[16px]">{p.tagline}</p>
              <Link href="/join" className="btn-line mt-6">Join the library</Link>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
