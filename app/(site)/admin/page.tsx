import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMember, isAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import type { ImportDraft } from "@/lib/types";
import type { StudioloPackage } from "@/lib/studiolo-package";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  const m = await currentMember();
  if (!m) redirect("/begin?next=/admin");
  if (!isAdmin(m)) return <section className="wrap pt-[150px] pb-24"><p className="body">This page is for the author of record only.</p></section>;
  const db = store();
  const [drafts, apps, inquiries] = await Promise.all([
    db.list<ImportDraft>("import_drafts", undefined, { column: "received_at", ascending: false }),
    db.list<{ id: string; full_name: string; email: string; where_now: string; intends_to_build: string; created_at: string }>("cohort_applications", undefined, { column: "created_at", ascending: false }),
    db.list<{ id: string; name: string; organization: string; work_email: string; created_at: string }>("org_inquiries", undefined, { column: "created_at", ascending: false }),
  ]);
  return (
    <section className="wrap pt-[150px] pb-[var(--section)]">
      <p className="eyebrow">Admin</p>
      <h1 className="h2 mt-6">Studiolo drafts</h1>
      <p className="body mt-4">Releases from Studiolo land here. Nothing is public until you publish it as author of record.</p>
      <ul className="mt-10 p-0 list-none">
        {drafts.length === 0 && <li className="body rule-top pt-6">No drafts.</li>}
        {drafts.map((d) => {
          const p = d.payload as StudioloPackage;
          return (
            <li key={d.id} className="rule-top py-5 flex flex-wrap justify-between gap-4">
              <Link href={`/admin/${d.id}`} className="title text-[22px]">{p.piece.title}</Link>
              <span className="text-[13px]" style={{ color: d.status === "draft" ? "var(--color-gold)" : "var(--color-dim)" }}>
                {p.format} · v{d.version} · {d.status} · {new Date(d.received_at).toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
      <h2 className="h2-sm mt-24">Cohort applications</h2>
      <ul className="mt-8 p-0 list-none text-[15px]">
        {apps.length === 0 && <li className="body rule-top pt-6">None yet.</li>}
        {apps.map((a) => (
          <li key={a.id} className="rule-top py-5">
            <p className="m-0">{a.full_name} · <a href={`mailto:${a.email}`}>{a.email}</a> · <span style={{ color: "var(--color-dim)" }}>{a.where_now}</span></p>
            <p className="body m-0 mt-2 text-[15px]">{a.intends_to_build}</p>
          </li>
        ))}
      </ul>
      <h2 className="h2-sm mt-24">Licensing inquiries</h2>
      <ul className="mt-8 p-0 list-none text-[15px]">
        {inquiries.length === 0 && <li className="body rule-top pt-6">None yet.</li>}
        {inquiries.map((q) => (
          <li key={q.id} className="rule-top py-4">{q.organization} · {q.name} · <a href={`mailto:${q.work_email}`}>{q.work_email}</a></li>
        ))}
      </ul>
    </section>
  );
}
