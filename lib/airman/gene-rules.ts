// Pure GENE rules (no I/O), testable.

/** Keyword pre-check. A hit skips the model, shows the fixed crisis message and raises a facilitator-only flag. */
const SAFETY = [/\bkill(ing)? myself\b/i, /\bsuicid/i, /\bend (it|my life)\b/i, /\bwant to die\b/i, /\bself[- ]?harm/i, /\bhurt myself\b/i, /\bno reason to live\b/i, /\bbetter off without me\b/i];
export const safetyHit = (text: string) => SAFETY.some((r) => r.test(text));
export const CRISIS_MESSAGE = "You don't have to carry this alone. Military Crisis Line: dial 988 then press 1, or text 838255. Your facilitator will follow up in person.";

export interface GeneRead { reasoning_grade: number; thinking_pattern: string; follow_up_question: string; flag: boolean }

/** Parse the model's JSON. Anything malformed is a failure (loud), never a guessed answer. */
export function parseRead(text: string): GeneRead {
  const m = /\{[\s\S]*\}/.exec(text);
  if (!m) throw new Error("GENE returned no reading.");
  const j = JSON.parse(m[0]);
  const grade = Number(j.reasoning_grade);
  if (!Number.isInteger(grade) || grade < 1 || grade > 5) throw new Error("GENE returned an invalid reading.");
  if (typeof j.follow_up_question !== "string" || !j.follow_up_question.trim()) throw new Error("GENE returned no question.");
  return { reasoning_grade: grade, thinking_pattern: String(j.thinking_pattern ?? "").slice(0, 200), follow_up_question: j.follow_up_question.trim(), flag: Boolean(j.flag) };
}

/**
 * Recognition cadence: about every third filed observation, surface one back as a reflection.
 * If the person's running true-or-partly-true rate is below 70%, halve the frequency (every sixth).
 * At most one reflection per turn (the caller asks once per turn).
 */
export function shouldReflect(observationCount: number, ratings: ("true" | "partly" | "not")[]) {
  const rated = ratings.length;
  const hits = ratings.filter((r) => r !== "not").length;
  const every = rated >= 3 && hits / rated < 0.7 ? 6 : 3;
  return observationCount > 0 && observationCount % every === 0;
}

export const MAX_GENE_QUESTIONS = 3;
