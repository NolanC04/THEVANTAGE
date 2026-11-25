import { moduleAccess, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { geneRead } from "@/lib/airman/gene";
import { safetyHit, MAX_GENE_QUESTIONS } from "@/lib/airman/gene-rules";
import { ok, fail, str } from "@/lib/airman/api";

/**
 * GENE outro: up to three questions, then one closing sentence. Only the question is shown; the grade
 * and pattern are filed as an observation (never displayed as a score). Safety pre-check runs first.
 */
export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  try {
    const { p, m, e, n } = await moduleAccess((await params).n);
    if (!e.bridge_at) throw new HttpError(403, "Submit the Bridge first.");
    if (e.sealed_at) throw new HttpError(409, "This module is sealed.");
    const db = store();
    const gene = [...e.gene];
    const answer = str((await req.json()).answer, 4000);
    if (gene.length) {
      if (gene[gene.length - 1].a != null) throw new HttpError(409, "GENE has closed this conversation.");
      if (!answer) throw new HttpError(400, "Write an answer first.");
      gene[gene.length - 1] = { ...gene[gene.length - 1], a: answer };
    }
    const latest = answer || e.remix || e.bridge!;
    if (safetyHit(latest)) {
      await db.insert("safety_flags", { user_id: p.id, anon_id: p.anon_id, module_number: n, source: "keyword", raised_at: new Date().toISOString(), followed_up_at: null, followed_up_by: null });
      await db.update("module_entries", { id: e.id }, { gene });
      return ok({ gene, crisis: true });
    }
    const asked = gene.length;
    const reflectPrompt = m.content.reflect_prompt ?? "";
    const { read, meta } = await geneRead({
      reflectPrompt,
      answer: e.remix || e.bridge!,
      history: gene.filter((g) => g.a != null).map((g) => ({ q: g.q, a: g.a! })),
      last: asked >= MAX_GENE_QUESTIONS,
    });
    // closing sentence is stored with a = "" so no further answer is requested
    gene.push({ q: read.follow_up_question, a: asked >= MAX_GENE_QUESTIONS ? "" : null });
    await db.update("module_entries", { id: e.id }, { gene });
    // Validation record: what GENE read, what it said, and exactly what produced it (V3 report, Section 9).
    await db.insert("gene_reads", { entry_id: e.id, user_id: p.id, module_number: n, turn: asked, reflect_prompt: reflectPrompt, answer: asked === 0 ? e.remix || e.bridge! : answer, reasoning_grade: read.reasoning_grade, thinking_pattern: read.thinking_pattern, follow_up_question: read.follow_up_question, ...meta, at: new Date().toISOString() });
    await db.insert("observations", { user_id: p.id, module_number: n, text: read.thinking_pattern, grade: read.reasoning_grade, rating: null, rated_at: null, surfaced: false, at: new Date().toISOString() });
    if (read.flag) await db.insert("safety_flags", { user_id: p.id, anon_id: p.anon_id, module_number: n, source: "model", raised_at: new Date().toISOString(), followed_up_at: null, followed_up_by: null });
    return ok({ gene, crisis: read.flag });
  } catch (e) {
    return fail(e);
  }
}

