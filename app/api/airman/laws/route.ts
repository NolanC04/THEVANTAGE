import { signedIn, HttpError } from "@/lib/airman/guard";
import { isAdmin, audit } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { env } from "@/lib/airman/env";
import { ok, fail, str } from "@/lib/airman/api";

// Closing Laws: Nolan-authored only. No model ever writes to this table.
export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!isAdmin(p) || (env.adminEmail && p.email !== env.adminEmail)) throw new HttpError(403, "Only Nolan authors Closing Laws.");
    const b = await req.json();
    const n = Number(b.n), text = str(b.text, 600);
    if (!text || b.attest !== true) throw new HttpError(400, "Write the law and confirm you authored it.");
    const db = store();
    const law = await db.insert<{ id: string }>("closing_laws", { module_number: n, text, authored_by: p.anon_id, approved: true, at: new Date().toISOString() });
    await db.update("modules", { number: n }, { closing_law_id: law.id });
    await audit(p, "closing_law.authored", `M${n}`);
    return ok();
  } catch (e) {
    return fail(e);
  }
}
