import { signedIn, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if ((await req.json()).confirm !== "DELETE") throw new HttpError(400, "Type DELETE to confirm.");
    const db = store();
    // GENE reads and any rater scores on them go with the Almanac (FK cascade in Postgres; explicit for the dev store).
    const reads = await db.list<{ id: string }>("gene_reads", { user_id: p.id });
    for (const r of reads) await db.remove("rater_scores", { read_id: r.id });
    await db.remove("gene_reads", { user_id: p.id });
    await Promise.all([db.remove("module_entries", { user_id: p.id }), db.remove("daily_reps", { user_id: p.id }), db.remove("observations", { user_id: p.id }), db.remove("framework_entries", { user_id: p.id })]);
    await db.insert("audit_log", { actor_id: p.id, actor_anon: p.anon_id, action: "almanac.deleted", target: p.id, detail: {}, at: new Date().toISOString() });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
