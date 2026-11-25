import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { currentMember, isAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { previewChecks } from "@/lib/publish";
import { renderMarkdown } from "@/lib/markdown";
import type { ImportDraft } from "@/lib/types";
import type { StudioloPackage } from "@/lib/studiolo-package";
import { PublishPanel } from "@/components/PublishPanel";

export const dynamic = "force-dynamic";

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const m = await currentMember();
  if (!m) redirect("/begin?next=/admin");
  if (!isAdmin(m)) notFound();
  const draft = await store().get<ImportDraft>("import_drafts", { id: (await params).id });
  if (!draft) notFound();
  const p = draft.payload as StudioloPackage;
  const { findings, target } = await previewChecks(draft);
  return (
    <section className="wrap pt-[150px] pb-[var(--section)] max-w-[960px]">
      <Link href="/admin" className="text-[14px]">← All drafts</Link>
      <p className="eyebrow mt-8">{p.format} · v{draft.version} · lands as {target}</p>
      <h1 className="h2 mt-4">{p.piece.title}</h1>
      <p className="mt-4 text-[14px]" style={{ color: "var(--color-dim)" }}>Author of record (from Studiolo): {p.author_of_record} · approved in Studiolo {new Date(p.approved_at).toLocaleString()}</p>
      <div className="mt-10 rule-top pt-8">
        <h2 className="eyebrow">Public rules</h2>
        {findings.length === 0 ? (
          <p className="body mt-3">All checks pass.</p>
        ) : (
          <ul className="mt-3 pl-5">
            {findings.map((f, i) => (
              <li key={i} className="error">{f.field}: {f.message}{f.match ? ` (“${f.match}”)` : ""}</li>
            ))}
          </ul>
        )}
      </div>
      <article className="prose-v mt-10 rule-top pt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body_md) }} />
      {draft.status === "draft" ? (
        <PublishPanel id={draft.id} blocked={findings.length > 0} expectedAuthor={p.author_of_record} />
      ) : (
        <p className="body mt-10 rule-top pt-8">{draft.status === "published" ? `Published by ${draft.published_by} on ${new Date(draft.published_at!).toLocaleString()} → ${draft.target}` : "Rejected."}</p>
      )}
    </section>
  );
}
