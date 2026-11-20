import Link from "next/link";
import type { Metadata } from "next";
import { publishedLibrary } from "@/lib/content";
import { ActionForm } from "@/components/ActionForm";

export const metadata: Metadata = { title: "Newsletter", description: "The Vantage newsletter and its archive." };
export const dynamic = "force-dynamic";

export default async function Newsletter({ searchParams }: { searchParams: Promise<{ confirmed?: string; invalid?: string }> }) {
  const sp = await searchParams;
  const issues = (await publishedLibrary()).filter((i) => i.kind === "newsletter");
  return (
    <section className="wrap pt-[150px] pb-[var(--section)] grid md:grid-cols-2 gap-16">
      <div>
        <p className="eyebrow">The newsletter</p>
        <h1 className="h2 mt-6">Letters from the studio.</h1>
        <p className="body mt-6 max-w-[28rem]">New releases, essays and what the programs are teaching. You confirm by email before anything arrives.</p>
        {sp.confirmed && <p role="status" className="title text-[24px] mt-8">Confirmed. You&apos;re on the list.</p>}
        {sp.invalid && <p role="alert" className="error mt-8">That confirmation link is no longer valid. Sign up again below.</p>}
        <div className="mt-10">
          <ActionForm endpoint="/api/subscribe" submit="Subscribe" success="Check your inbox to confirm." fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]} />
        </div>
      </div>
      <div>
        <h2 className="eyebrow eyebrow-dim">Archive</h2>
        {issues.length === 0 ? (
          <p className="body mt-6">The first issue is in the studio.</p>
        ) : (
          <ul className="mt-6 p-0 list-none">
            {issues.map((i) => (
              <li key={i.id} className="rule-top py-5">
                <Link href={`/library/${i.slug}`} className="title text-[24px] no-underline" style={{ color: "var(--color-text)" }}>{i.title}</Link>
                {i.published_at && <p className="m-0 mt-1 text-[13px]" style={{ color: "var(--color-dim)" }}>{new Date(i.published_at).toLocaleDateString()}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
