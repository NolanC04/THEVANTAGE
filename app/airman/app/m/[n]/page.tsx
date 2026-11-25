import Link from "next/link";
import { notFound } from "next/navigation";
import { currentProfile } from "@/lib/airman/auth";
import { moduleRow, canRead, ensureEntry } from "@/lib/airman/data";
import { store } from "@/lib/airman/store";
import { buildSlides, visibleSlides } from "@/lib/airman/slides";
import { code, phaseOf, sessionOf, LEARNER_FIELDS, type ModuleContent } from "@/lib/airman/program";
import { Player } from "./Player";

export default async function ModulePage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1 || n > 24) notFound();
  const p = (await currentProfile())!;
  const m = await moduleRow(n);
  if (!m) notFound();
  if (!(await canRead(p, n)))
    return (
      <main className="page">
        <p className="k">{code(n)} · LOCKED</p>
        <h1 style={{ fontSize: 22 }}>This module opens in class.</h1>
        <p>Your facilitator opens modules for the class. Join with the class code when the session starts.</p>
        <Link className="btn" href="/airman/app/join">Join class</Link>
      </main>
    );
  const entry = await ensureEntry(p.id, n);
  const learner = Object.fromEntries(LEARNER_FIELDS.filter((k) => m.content[k] != null).map((k) => [k, m.content[k]])) as ModuleContent;
  const law = m.closing_law_id ? await store().get<{ text: string; approved: boolean }>("closing_laws", { id: m.closing_law_id }) : null;
  const slides = visibleSlides(buildSlides(n, learner), Boolean(entry.bridge_at));
  return (
    <Player
      n={n}
      code={code(n)}
      image={m.image_url}
      phase={phaseOf(n).emblem}
      session={sessionOf(n)}
      slides={slides}
      content={learner}
      entry={{ bridge: entry.bridge, bridge_at: entry.bridge_at, remix: entry.remix, quick_check: entry.quick_check, gene: entry.gene, sealed_at: entry.sealed_at, shared: entry.shared }}
      closingLaw={law?.approved ? law.text : null}
    />
  );
}
