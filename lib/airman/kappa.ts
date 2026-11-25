// Agreement statistics for GENE validation (pure, testable).

export interface Pair { gene: number; human: number }

/**
 * Quadratic weighted kappa on an ordinal 1..k scale (Cohen 1968), the usual statistic in essay-scoring
 * validation. 1 = perfect agreement, 0 = chance, negative = worse than chance. Null when undefined
 * (no pairs, or both raters used a single identical category so expected disagreement is zero).
 */
export function quadraticWeightedKappa(pairs: Pair[], min = 1, max = 5): number | null {
  const k = max - min + 1;
  if (!pairs.length || k < 2) return null;
  const O = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  const a = new Array<number>(k).fill(0), b = new Array<number>(k).fill(0);
  for (const { gene, human } of pairs) {
    if (gene < min || gene > max || human < min || human > max) throw new Error("Score outside the rubric scale.");
    O[gene - min][human - min]++; a[gene - min]++; b[human - min]++;
  }
  const n = pairs.length;
  let obs = 0, exp = 0;
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
    const w = ((i - j) ** 2) / ((k - 1) ** 2);
    obs += w * O[i][j];
    exp += w * (a[i] * b[j]) / n;
  }
  return exp === 0 ? null : 1 - obs / exp;
}

export const exactAgreement = (pairs: Pair[]) => (pairs.length ? pairs.filter((p) => p.gene === p.human).length / pairs.length : null);
export const adjacentAgreement = (pairs: Pair[]) => (pairs.length ? pairs.filter((p) => Math.abs(p.gene - p.human) <= 1).length / pairs.length : null);

/** When a read has several human scores, compare GENE to their mean, rounded half up. */
export function pairsFrom(reads: { id: string; reasoning_grade: number }[], scores: { read_id: string; grade: number }[]): Pair[] {
  return reads.flatMap((r) => {
    const s = scores.filter((x) => x.read_id === r.id);
    if (!s.length) return [];
    return [{ gene: r.reasoning_grade, human: Math.floor(s.reduce((t, x) => t + x.grade, 0) / s.length + 0.5) }];
  });
}

/** Two raters scoring the same read: human-human agreement is the ceiling GENE is judged against. */
export function humanPairs(scores: { read_id: string; rater_id: string; grade: number }[]): Pair[] {
  const by = new Map<string, { rater_id: string; grade: number }[]>();
  for (const s of scores) by.set(s.read_id, [...(by.get(s.read_id) ?? []), s]);
  return [...by.values()].filter((v) => v.length >= 2).map((v) => {
    const [x, y] = [...v].sort((p, q) => p.rater_id.localeCompare(q.rater_id));
    return { gene: x.grade, human: y.grade };
  });
}
