// Public rules, re-run on every publish. Pure functions so they are testable.
export interface Finding {
  rule: "aapex_name" | "military_branding" | "clinical_language" | "partisan_language" | "author_of_record" | "placeholder";
  field: string;
  match: string;
  message: string;
}

const CLINICAL = ["therapy", "therapist", "therapeutic", "counseling", "counselling", "counselor", "treatment", "diagnosis", "diagnose", "diagnosed", "disorder", "symptom", "symptoms", "clinical", "patient", "ptsd", "depression"];
// Historical phrases that are not clinical claims.
const CLINICAL_ALLOW = [/great depression/gi];
const MILITARY_BRANDING = ["usaf", "u\\.s\\. air force official", "air force approved", "dod approved", "endorsed by the air force", "endorsed by the department of defense", "senior airman", "staff sergeant", "technical sergeant", "master sergeant", "chief master sergeant", "airman first class", "second lieutenant", "first lieutenant", "lieutenant colonel", "brigadier general", "major general", "insignia", "chevrons"];
const PARTISAN = ["democrat", "democrats", "republican", "republicans", "liberal", "liberals", "conservative", "conservatives", "maga", "woke", "leftist", "right-wing", "left-wing", "progressive agenda"];

const word = (w: string) => new RegExp(`\\b${w}\\b`, "gi");

function scan(text: string, words: string[], allow: RegExp[] = []) {
  let t = text;
  allow.forEach((a) => (t = t.replace(a, " ")));
  const hits = new Set<string>();
  for (const w of words) for (const m of t.matchAll(word(w))) hits.add(m[0]);
  return [...hits];
}

/**
 * @param fields name → text of every public field in the piece
 * @param context where the piece will appear. AAPEX may be named only on Organizations,
 *   the military/veteran free tier, and the AAPEX program album itself (approved canvas, 19 Nov 2026).
 */
export function checkPublic(
  fields: Record<string, string | null | undefined>,
  context: { aapexAllowed: boolean; authorOfRecord: string | null | undefined },
): Finding[] {
  const out: Finding[] = [];
  if (!context.authorOfRecord?.trim())
    out.push({ rule: "author_of_record", field: "author_of_record", match: "", message: "A named author of record is required." });
  for (const [field, raw] of Object.entries(fields)) {
    const text = raw ?? "";
    if (!context.aapexAllowed)
      for (const m of scan(text, ["aapex"])) out.push({ rule: "aapex_name", field, match: m, message: "AAPEX is named publicly only on Organizations and the military/veteran tier." });
    for (const m of scan(text, MILITARY_BRANDING)) out.push({ rule: "military_branding", field, match: m, message: "No rank, insignia or implied endorsement. Mention service as plain fact only." });
    for (const m of scan(text, CLINICAL, CLINICAL_ALLOW)) out.push({ rule: "clinical_language", field, match: m, message: "No clinical language. This is an educational program." });
    for (const m of scan(text, PARTISAN)) out.push({ rule: "partisan_language", field, match: m, message: "Public pieces are nonpartisan." });
    for (const m of text.matchAll(/\[(NOLAN|TODO|TK)[^\]]*\]/g)) out.push({ rule: "placeholder", field, match: m[0], message: "Unfilled gap. Fill it in Studiolo before publishing." });
  }
  return out;
}
