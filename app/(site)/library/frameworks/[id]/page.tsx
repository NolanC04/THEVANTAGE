import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { currentMember, isAdmin } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/access";
import { frameworkById, FRAMEWORKS } from "@/lib/frameworks/registry";
import { FrameworkCard } from "@/components/frameworks/FrameworkCard";
import { memberSaved } from "@/lib/frameworks/entries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const f = frameworkById((await params).id);
  return f && f.status === "live" ? { title: f.title, description: f.concept.slice(0, 155) } : {};
}

export default async function FrameworkPage({ params }: { params: Promise<{ id: string }> }) {
  const f = frameworkById((await params).id);
  const member = await currentMember();
  const admin = isAdmin(member);
  if (!f || (f.status === "held" && !admin)) notFound();
  const open = admin || (member != null && hasPaidAccess(member));
  const saved = open && member ? (await memberSaved(member.id))[f.id] ?? null : null;
  const live = FRAMEWORKS.filter((x) => x.status === "live" || admin);
  const i = live.findIndex((x) => x.id === f.id);
  const prev = live[i - 1], next = live[i + 1];

  return (
    <div className="wrap pt-[150px] pb-[var(--section)] max-w-[1080px]">
      <p className="eyebrow"><Link href="/library/frameworks" className="no-underline">Frameworks</Link></p>
      {open ? (
        <div className="mt-8"><FrameworkCard fw={f} admin={admin} heading="h1" saved={saved} save={member ? { endpoint: "/api/frameworks/save" } : undefined} /></div>
      ) : (
        <article className="max-w-[760px]">
          <p className="text-[13px] mt-6 mb-0" style={{ color: "var(--color-dim)" }}>{f.type}</p>
          <h1 className="h2 mt-4">{f.title}</h1>
          <p className="body mt-6">{f.concept}</p>
          <div className="mt-10 rule-top pt-8">
            <p className="body">{member ? "The working framework is part of The Vantage Library." : "Sign in with your email to see whether this framework is open to you."}</p>
            <div className="flex flex-wrap gap-6 mt-6 items-center">
              <Link className="btn-gold" href={member ? "/join" : `/begin?next=/library/frameworks/${f.id}`}>{member ? "Join the library" : "Begin with your email"}</Link>
              {f.aapex.length > 0 && <Link href={`/programs/aapex/${f.aapex[0]}`}>It&apos;s also inside Module {String(f.aapex[0]).padStart(2, "0")}</Link>}
            </div>
          </div>
        </article>
      )}
      <nav aria-label="More frameworks" className="rule-top mt-20 pt-8 flex justify-between gap-6 text-[15px]">
        {prev ? <Link href={`/library/frameworks/${prev.id}`}>← {prev.title}</Link> : <span />}
        {next ? <Link href={`/library/frameworks/${next.id}`} className="text-right">{next.title} →</Link> : <span />}
      </nav>
    </div>
  );
}
