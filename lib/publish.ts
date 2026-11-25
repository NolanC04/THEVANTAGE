import "server-only";
import { store } from "./store";
import { checkPublic, type Finding } from "./rules";
import { targetFor, type StudioloPackage } from "./studiolo-package";
import type { ImportDraft, Program, Module } from "./types";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function previewChecks(draft: ImportDraft): Promise<{ findings: Finding[]; target: string }> {
  const p = draft.payload as StudioloPackage;
  const t = targetFor(p);
  // AAPEX may be named inside its own album (approved canvas). Elsewhere it is flagged.
  const aapexAllowed = t.table === "modules" && p.piece.program?.toUpperCase() === "AAPEX";
  const findings = checkPublic({ title: p.piece.title, one_line: p.piece.one_line, gene_question: p.piece.gene_question, body_md: p.body_md }, { aapexAllowed, authorOfRecord: p.author_of_record });
  return { findings, target: t.table === "modules" ? `Module ${p.piece.module_number} of ${p.piece.program}` : `Library · ${t.kind}` };
}

/** Publish requires the admin, a confirmation, a named author of record, and zero findings. */
export async function publishDraft(draftId: string, approvedBy: string, authorOfRecord: string) {
  const db = store();
  const draft = await db.get<ImportDraft>("import_drafts", { id: draftId });
  if (!draft) throw new Error("Draft not found.");
  if (draft.status !== "draft") throw new Error(`Already ${draft.status}.`);
  const p = draft.payload as StudioloPackage;
  const { findings } = await previewChecks(draft);
  if (findings.length) return { published: false as const, findings };
  if (authorOfRecord.trim() !== p.author_of_record.trim()) return { published: false as const, findings: [{ rule: "author_of_record" as const, field: "author_of_record", match: authorOfRecord, message: `Author of record must match the package (${p.author_of_record}).` }] };

  const now = new Date().toISOString();
  const t = targetFor(p);
  let target: string;
  if (t.table === "modules") {
    const program = await db.get<Program>("programs", { word: p.piece.program!.toUpperCase() });
    if (!program) throw new Error(`Program ${p.piece.program} does not exist in The Vantage yet.`);
    const existing = await db.get<Module>("modules", { program_id: program.id, number: p.piece.module_number! });
    const patch = {
      body_md: p.body_md, status: "published", author_of_record: p.author_of_record, published_at: now,
      ...(p.piece.gene_question ? { gene_question: p.piece.gene_question } : {}),
      ...(p.piece.minutes ? { minutes: p.piece.minutes } : {}),
    };
    if (existing) await db.update("modules", { id: existing.id }, patch);
    else await db.insert("modules", { program_id: program.id, number: p.piece.module_number!, title: p.piece.title, phase: null, cover_url: p.assets[0]?.url ?? null, cover_alt: p.assets[0]?.alt ?? null, gene_question: null, minutes: null, ...patch });
    target = `modules:${program.slug}/${p.piece.module_number}`;
  } else {
    const slug = slugify(p.piece.title);
    await db.upsert("library_items", {
      kind: t.kind, slug, title: p.piece.title, summary: p.piece.one_line ?? null, body_md: p.body_md, url: null,
      cover_url: p.assets[0]?.url ?? null, cover_alt: p.assets[0]?.alt ?? null,
      tier_required: t.kind === "newsletter" ? "public" : "library",
      status: "published", author_of_record: p.author_of_record, published_at: now,
    }, "slug");
    target = `library_items:${slug}`;
  }
  await db.update("import_drafts", { id: draft.id }, { status: "published", published_by: approvedBy, published_at: now, target });
  await db.insert("publish_log", { draft_id: draft.id, author_of_record: p.author_of_record, approved_by: approvedBy, findings: [] });
  return { published: true as const, target };
}
