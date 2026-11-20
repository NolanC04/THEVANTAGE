import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

/**
 * Contract: studiolo.vantage/1 (one-way, Studiolo → The Vantage).
 * Headers:
 *   X-Studiolo-Timestamp: unix seconds
 *   X-Studiolo-Signature: sha256=<hex HMAC-SHA256 of `${timestamp}.${rawBody}` with VANTAGE_IMPORT_SECRET>
 * Requests older than 5 minutes are rejected (replay guard). See docs/contracts/studiolo.vantage-1.md.
 */
export const FORMATS = [
  "book chapter", "workbook pages", "cohort lesson plan", "self-paced lesson", "talk outline", "slide outline",
  "socratic assessment", "program blueprint", "article", "newsletter", "social carousel", "quote cards",
  "worksheet", "skill sheet", "resource bank", "narrative story", "lyric sketch",
] as const;

export const packageSchema = z.object({
  schema: z.literal("studiolo.vantage/1"),
  package_id: z.string().min(1),
  version: z.number().int().positive(),
  piece: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    category: z.string().optional(),
    program: z.string().nullable().optional(), // program word, e.g. "AAPEX"
    module_number: z.number().int().positive().nullable().optional(),
    one_line: z.string().nullable().optional(),
    gene_question: z.string().nullable().optional(), // the module's GENE question, authored by Nolan
    minutes: z.number().int().positive().nullable().optional(),
  }),
  format: z.enum(FORMATS),
  body_md: z.string().min(1),
  assets: z.array(z.object({ name: z.string(), url: z.string().url(), alt: z.string().optional() })).default([]),
  author_of_record: z.string().min(1),
  approved_at: z.string().datetime(),
});
export type StudioloPackage = z.infer<typeof packageSchema>;

export function sign(secret: string, timestamp: string, rawBody: string) {
  return "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

export function verifySignature(secret: string, timestamp: string | null, signature: string | null, rawBody: string, now = Date.now()) {
  if (!secret || !timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(now / 1000 - ts) > 300) return false;
  const a = Buffer.from(sign(secret, timestamp, rawBody));
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Where a published package lands in The Vantage. */
export function targetFor(p: StudioloPackage): { table: "modules" | "library_items"; kind?: string } {
  if (p.format === "self-paced lesson" && p.piece.program && p.piece.module_number) return { table: "modules" };
  const kind =
    p.format === "newsletter" ? "newsletter"
    : p.format === "skill sheet" || p.format === "worksheet" ? "skill_sheet"
    : p.format === "book chapter" || p.format === "workbook pages" ? "book"
    : "article";
  return { table: "library_items", kind };
}
