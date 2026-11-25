import { store } from "@/lib/store";
import { env } from "@/lib/env";
import { packageSchema, verifySignature } from "@/lib/studiolo-package";
import { ok, bad, fail } from "@/lib/api";

/**
 * One-way intake from Studiolo (studiolo.vantage/1). Pieces land as drafts; only Nolan publishes.
 * The Vantage never calls Studiolo.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!env.importSecret) return bad("Import is not configured (VANTAGE_IMPORT_SECRET).", 503);
  if (!verifySignature(env.importSecret, req.headers.get("x-studiolo-timestamp"), req.headers.get("x-studiolo-signature"), raw))
    return bad("Invalid signature.", 401);
  let parsed;
  try {
    parsed = packageSchema.safeParse(JSON.parse(raw));
  } catch {
    return bad("Body is not JSON.", 400);
  }
  if (!parsed.success) return bad(`Package rejected: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`, 422);
  const p = parsed.data;
  try {
    const existing = await store().get<{ id: string; status: string }>("import_drafts", { package_id: p.package_id, version: p.version });
    if (existing) return ok({ id: existing.id, status: existing.status, duplicate: true });
    const row = await store().insert<{ id: string }>("import_drafts", {
      package_id: p.package_id,
      version: p.version,
      schema: p.schema,
      payload: p,
      received_at: new Date().toISOString(),
      status: "draft",
      published_by: null,
      published_at: null,
      target: null,
    });
    return ok({ id: row.id, status: "draft" }, 201);
  } catch (e) {
    return fail(e);
  }
}
