import Link from "next/link";
import type { Metadata } from "next";
import { currentMember, isAdmin } from "@/lib/auth";
import { visibleFrameworks } from "@/lib/frameworks/registry";

export const metadata: Metadata = { title: "Catalyst Concepts", description: "Interactive frameworks from The Vantage: self-assessments, maps and builds you work through on the page." };
export const dynamic = "force-dynamic";

const pad = (n: number) => String(n).padStart(2, "0");

export default async function Frameworks() {
  const admin = isAdmin(await currentMember());
  const list = visibleFrameworks(admin);
  return (
    <div className="pt-[120px] md:pt-[150px]">
      <section className="wrap">
        <p className="eyebrow">The Library · Frameworks</p>
        <h1 className="h2 mt-6 max-w-[18ch]">Catalyst Concepts</h1>
        <p className="body mt-6 max-w-[36rem]">Each framework is drawn, then made to answer back: rate yourself, build the structure, run the test. Members open every one. Some also sit inside a program module, where they arrive as that lesson&apos;s practice.</p>
      </section>
      <section className="wrap section" aria-labelledby="fw-shelf">
        <h2 id="fw-shelf" className="sr-only">All frameworks</h2>
        <ol className="grid gap-x-10 gap-y-12 p-0 m-0 list-none" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))" }}>
          {list.map((f, i) => (
            <li key={f.id} className="rule-top pt-6">
              <Link href={`/library/frameworks/${f.id}`} className="no-underline" style={{ color: "var(--color-text)" }}>
                <p className="eyebrow text-[11px]">{pad(i + 1)} · {f.type}{f.status === "held" ? " · Held" : ""}</p>
                <p className="title text-[28px] leading-[1.1] mt-3 mb-0">{f.title}</p>
                <p className="body mt-3 mb-0 text-[15px] line-clamp-3">{f.concept}</p>
              </Link>
              {f.aapex.length > 0 && (
                <p className="mt-3 mb-0 text-[13px]" style={{ color: "var(--color-dim)" }}>
                  Inside {f.aapex.map((n, k) => <span key={n}>{k > 0 && ", "}<Link href={`/programs/aapex/${n}`}>Module {pad(n)}</Link></span>)}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
