import "server-only";
import { store } from "./store";
import { settings } from "./data";
import { HttpError } from "./guard";
import type { Profile } from "./auth";
import { quadraticWeightedKappa, exactAgreement, adjacentAgreement, pairsFrom, humanPairs } from "./kappa";

export interface GeneReadRow {
  id: string; entry_id: string; user_id: string; module_number: number; turn: number; reflect_prompt: string; answer: string;
  reasoning_grade: number; thinking_pattern: string | null; follow_up_question: string; model: string; prompt_ref: string;
  prompt_sha256: string; rubric_version: string; input_tokens: number | null; output_tokens: number | null; latency_ms: number | null; at: string;
}
export interface RaterScoreRow { id: string; read_id: string; rater_id: string; grade: number; rubric_version: string; note: string | null; at: string }

/**
 * Rubric anchors raters score against. Nolan writes these from the formative-assessment sources before
 * raters start; until then they render as gaps and the rater queue stays closed.
 */
export const RUBRIC_ANCHORS: [number, string][] = [
  [1, "[NOLAN: anchor for 1]"], [2, "[NOLAN: anchor for 2]"], [3, "[NOLAN: anchor for 3]"], [4, "[NOLAN: anchor for 4]"], [5, "[NOLAN: anchor for 5]"],
];
export const rubricWritten = () => RUBRIC_ANCHORS.every(([, t]) => !t.startsWith("[NOLAN"));

export const canRate = (p: Profile) => p.role === "rater" || p.role === "admin";

/** The next first-turn read this rater has not scored. Never their own writing. Identity and GENE's grade are stripped. */
export async function nextForRater(p: Profile) {
  if (!canRate(p)) throw new HttpError(403, "Raters only.");
  const s = await settings();
  if (!s.rater_review_enabled) return { closed: true as const };
  const db = store();
  const [reads, mine] = await Promise.all([
    db.list<GeneReadRow>("gene_reads", { turn: 0 }, { column: "at" }),
    db.list<RaterScoreRow>("rater_scores", { rater_id: p.id }),
  ]);
  const done = new Set(mine.map((m) => m.read_id));
  const left = reads.filter((r) => !done.has(r.id) && r.user_id !== p.id);
  const r = left[0];
  return { closed: false as const, remaining: left.length, scored: done.size, item: r ? { id: r.id, module_number: r.module_number, reflect_prompt: r.reflect_prompt, answer: r.answer } : null };
}

export async function scoreRead(p: Profile, readId: string, grade: number, note: string, rubricVersion: string) {
  if (!canRate(p)) throw new HttpError(403, "Raters only.");
  if (!(await settings()).rater_review_enabled) throw new HttpError(409, "Rater review is closed.");
  if (!Number.isInteger(grade) || grade < 1 || grade > 5) throw new HttpError(400, "Pick a score from 1 to 5.");
  const db = store();
  const read = await db.get<GeneReadRow>("gene_reads", { id: readId, turn: 0 });
  if (!read) throw new HttpError(404, "Not found.");
  if (read.user_id === p.id) throw new HttpError(403, "You can't score your own writing.");
  if (await db.get("rater_scores", { read_id: readId, rater_id: p.id })) throw new HttpError(409, "Already scored.");
  await db.insert("rater_scores", { read_id: readId, rater_id: p.id, grade, rubric_version: rubricVersion, note: note || null, at: new Date().toISOString() });
}

/** Admin view: agreement, coverage, versions in use, and token totals for the cost estimate. */
export async function validationSummary() {
  const db = store();
  const [reads, scores] = await Promise.all([db.list<GeneReadRow>("gene_reads"), db.list<RaterScoreRow>("rater_scores")]);
  const first = reads.filter((r) => r.turn === 0);
  const pairs = pairsFrom(first, scores);
  const hh = humanPairs(scores);
  const tokens = reads.reduce((t, r) => ({ in: t.in + (r.input_tokens ?? 0), out: t.out + (r.output_tokens ?? 0) }), { in: 0, out: 0 });
  const versions = [...new Set(reads.map((r) => `${r.model} · prompt ${r.prompt_sha256.slice(0, 8)} (${r.prompt_ref}) · rubric ${r.rubric_version}`))];
  return {
    reads: reads.length, firstReads: first.length, scoredReads: pairs.length, raters: new Set(scores.map((s) => s.rater_id)).size,
    qwk: quadraticWeightedKappa(pairs), exact: exactAgreement(pairs), adjacent: adjacentAgreement(pairs),
    humanPairs: hh.length, humanQwk: quadraticWeightedKappa(hh),
    tokens, avgTokens: reads.length ? { in: tokens.in / reads.length, out: tokens.out / reads.length } : null,
    versions,
  };
}
