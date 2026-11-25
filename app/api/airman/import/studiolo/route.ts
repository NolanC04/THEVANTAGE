import { env } from "@/lib/airman/env";
import { packageSchema, verifySignature } from "@/lib/airman/studiolo-package";
import { propose } from "@/lib/airman/imports";
import { store } from "@/lib/airman/store";
import { ok, bad, fail } from "@/lib/airman/api";

// One-way intake from Studiolo (studiolo.apex/1). Lands as a proposal with a diff; an admin approves it.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!env.importSecret) return bad("Import is not configured (APEX_IMPORT_SECRET).", 503);
  if (!verifySignature(env.importSecret, req.headers.get("x-studiolo-timestamp"), req.headers.get("x-studiolo-signature"), raw)) return bad("Invalid signature.", 401);
  let parsed;
  try {
    parsed = packageSchema.safeParse(JSON.parse(raw));
  } catch {
    return bad("Body is not JSON.");
  }
  if (!parsed.success) return bad(`Package rejected: ${parsed.error.issues.map((i) => i.path.join(".") + " " + i.message).join("; ")}`, 422);
  const p = parsed.data;
  if (p.piece.program?.toUpperCase() !== "AAPEX" || !p.piece.module_number) return bad("This segment accepts AAPEX module packages only.", 422);
  try {
    if (await store().get("import_proposals", { source: `studiolo:${p.package_id}:v${p.version}` })) return ok({ duplicate: true });
    const n = await propose(`studiolo:${p.package_id}:v${p.version}`, [{ n: p.piece.module_number, content: { title: p.piece.title, learn_md: p.body_md, ...(p.piece.gene_question ? { reflect_prompt: p.piece.gene_question } : {}) } }], `studiolo (${p.author_of_record})`);
    return ok({ proposals: n }, 201);
  } catch (e) {
    return fail(e);
  }
}
