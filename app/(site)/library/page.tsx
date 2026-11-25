import Link from "next/link";
import type { Metadata } from "next";
import { publishedLibrary } from "@/lib/content";
import { LIBRARY_KINDS, type LibraryKind } from "@/lib/types";

export const metadata: Metadata = { title: "Library", description: "Videos, articles, books, newsletters and skill sheets from The Vantage." };
export const dynamic = "force-dynamic";

export default async function Library({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const active = LIBRARY_KINDS.find((k) => k.kind === type)?.kind as LibraryKind | undefined;
  const items = (await publishedLibrary()).filter((i) => !active || i.kind === active);
  return (
    <div className="pt-[120px] md:pt-[150px]">
      <section className="relative overflow-hidden">
        <div className="wrap grid md:grid-cols-2 gap-12 items-end">
          <div>
            <p className="eyebrow">The Library</p>
            <h1 className="h2 mt-6">Inside, the program reads you back.</h1>
            <p className="body mt-6 max-w-[30rem]">Every program, your guide GENE, and an Almanac that stays yours. Members open everything below.</p>
            <div className="flex flex-wrap gap-6 mt-8 items-center">
              <Link href="/account" className="btn-gold">Open your library</Link>
              <Link href="/join">Join for $29 a month</Link>
            </div>
          </div>
          <div className="frame aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/paintings/open-book-quill.jpg" alt="An open book with a quill resting across its pages" />
          </div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="shelf">
        <h2 id="shelf" className="h2-sm">The shelf</h2>
        <nav aria-label="Filter by type" className="flex flex-wrap gap-x-8 gap-y-3 mt-8 text-[14px] tracking-[.04em]">
          <Link href="/library" aria-current={!active ? "page" : undefined} style={{ color: !active ? "var(--color-gold)" : "var(--color-muted)" }}>All</Link>
          {LIBRARY_KINDS.map((k) => (
            <Link key={k.kind} href={`/library?type=${k.kind}`} aria-current={active === k.kind ? "page" : undefined} style={{ color: active === k.kind ? "var(--color-gold)" : "var(--color-muted)" }}>
              {k.label}
            </Link>
          ))}
          <Link href="/library/frameworks" style={{ color: "var(--color-muted)" }}>Frameworks →</Link>
        </nav>
        {items.length === 0 ? (
          <p className="body mt-12 rule-top pt-8">Nothing on this shelf yet. New pieces arrive as Nolan releases them from the studio.</p>
        ) : (
          <ul className="grid gap-x-8 gap-y-14 mt-12 p-0 list-none" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
            {items.map((i) => (
              <li key={i.id}>
                <Link href={`/library/${i.slug}`} className="no-underline" style={{ color: "var(--color-text)" }}>
                  {i.cover_url && (
                    <div className="frame aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.cover_url} alt={i.cover_alt ?? ""} loading="lazy" />
                    </div>
                  )}
                  <p className="eyebrow mt-5 text-[11px]">{LIBRARY_KINDS.find((k) => k.kind === i.kind)?.label}{i.tier_required === "library" ? " · Members" : ""}</p>
                  <p className="title text-[26px] mt-2 mb-0">{i.title}</p>
                  {i.summary && <p className="body mt-2 mb-0 text-[15px]">{i.summary}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
