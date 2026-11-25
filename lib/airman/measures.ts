// Validated, free-to-use scales. Item text copied verbatim from the approved pilot app (docs/design/pilot-app/index.html).
export interface Measure { id: "swls" | "gse" | "brs"; name: string; cite: string; min: number; max: number; anchors: [string, string]; rev: number[]; items: string[]; score: "sum" | "mean" }
export const MEASURES: Measure[] = [
  { id: "swls", name: "Satisfaction with Life", cite: "Diener, Emmons, Larsen & Griffin (1985)", min: 1, max: 7, anchors: ["Strongly disagree", "Strongly agree"], rev: [], items: ["In most ways my life is close to my ideal.", "The conditions of my life are excellent.", "I am satisfied with my life.", "So far I have gotten the important things I want in life.", "If I could live my life over, I would change almost nothing."], score: "sum" },
  { id: "gse", name: "General Self-Efficacy", cite: "Schwarzer & Jerusalem (1995)", min: 1, max: 4, anchors: ["Not at all true", "Exactly true"], rev: [], items: ["I can always manage to solve difficult problems if I try hard enough.", "If someone opposes me, I can find the means and ways to get what I want.", "It is easy for me to stick to my aims and accomplish my goals.", "I am confident that I could deal efficiently with unexpected events.", "Thanks to my resourcefulness, I know how to handle unforeseen situations.", "I can solve most problems if I invest the necessary effort.", "I can remain calm when facing difficulties because I can rely on my coping abilities.", "When I am confronted with a problem, I can usually find several solutions.", "If I am in trouble, I can usually think of a solution.", "I can usually handle whatever comes my way."], score: "sum" },
  { id: "brs", name: "Brief Resilience", cite: "Smith et al. (2008)", min: 1, max: 5, anchors: ["Strongly disagree", "Strongly agree"], rev: [1, 3, 5], items: ["I tend to bounce back quickly after hard times.", "I have a hard time making it through stressful events.", "It does not take me long to recover from a stressful event.", "It is hard for me to snap back when something bad happens.", "I usually come through difficult times with little trouble.", "I tend to take a long time to get over set-backs in my life."], score: "mean" },
];
export const WAVES = [
  ["T0", "Baseline", "Before session one"],
  ["T1", "Midpoint", "After session four"],
  ["T2", "Completion", "After session eight"],
  ["T3", "Follow-up", "60–90 days after completion"],
] as const;
export type Wave = (typeof WAVES)[number][0];
export type Group = "cohort" | "comparison";

/** Same scoring as the pilot app: reverse-score listed items (max+min−x), then sum or mean (2 dp). */
export function scoreOf(m: Measure, arr: (number | null | undefined)[] | undefined): number | null {
  if (!arr || arr.length !== m.items.length || arr.some((v) => v == null)) return null;
  const v = arr.map((x, i) => (m.rev.includes(i) ? m.max + m.min - (x as number) : (x as number)));
  const s = v.reduce((a, b) => a + b, 0);
  return m.score === "mean" ? +(s / v.length).toFixed(2) : s;
}

export interface CheckinRow { anon_id: string; group: Group; wave: Wave; responses: Record<string, number[]> }
export interface Stat { n: number; mean: number; sd: number }

export function stat(rows: CheckinRow[], g: Group, w: Wave, m: Measure): Stat | null {
  const v = rows.filter((r) => r.group === g && r.wave === w).map((r) => scoreOf(m, r.responses[m.id])).filter((x): x is number => x != null);
  if (!v.length) return null;
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, v.length - 1));
  return { n: v.length, mean, sd };
}

/** Diff-in-diff (T0 → latest wave) and Cohen's d on the cohort change with pooled SD — the pilot app's method. */
export function effect(rows: CheckinRow[], m: Measure) {
  const latest = (["T3", "T2", "T1"] as Wave[]).find((w) => stat(rows, "cohort", w, m));
  const c0 = stat(rows, "cohort", "T0", m);
  if (!latest || !c0) return { latest: null, did: null, d: null };
  const c1 = stat(rows, "cohort", latest, m)!, k0 = stat(rows, "comparison", "T0", m), k1 = stat(rows, "comparison", latest, m);
  const did = k0 && k1 ? c1.mean - c0.mean - (k1.mean - k0.mean) : null;
  const pooled = Math.sqrt((c0.sd ** 2 + c1.sd ** 2) / 2) || null;
  return { latest, did, d: pooled ? (c1.mean - c0.mean) / pooled : null };
}

export function toCSV(rows: CheckinRow[]) {
  const head = ["anon_id", "group", "wave", ...MEASURES.map((m) => m.id)];
  const lines = rows.map((r) => [r.anon_id, r.group, r.wave, ...MEASURES.map((m) => scoreOf(m, r.responses[m.id]) ?? "")].join(","));
  return [head.join(","), ...lines].join("\n");
}
