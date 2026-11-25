import { signedIn, HttpError } from "@/lib/airman/guard";
import { isAdmin, audit } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import type { ModuleRow } from "@/lib/airman/program";
import { ok, fail } from "@/lib/airman/api";

// Publishing bumps the module's version; existing learner answers are untouched.
export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!isAdmin(p)) throw new HttpError(403, "Admins only.");
    const { id, decision, confirm } = await req.json();
    const db = store();
    const prop = await db.get<{ id: string; module_number: number; proposed: Record<string, unknown>; base_version: number; status: string }>("import_proposals", { id, status: "pending" });
    if (!prop) throw new HttpError(404, "Proposal not found.");
    if (decision === "reject") {
      await db.update("import_proposals", { id }, { status: "rejected", decided_by: p.id, decided_at: new Date().toISOString() });
      await audit(p, "import.rejected", id);
      return ok();
    }
    if (confirm !== true) throw new HttpError(400, "Check the box to confirm you reviewed every change.");
    const m = await db.get<ModuleRow>("modules", { number: prop.module_number });
    if (!m) throw new HttpError(404, "Module not found.");
    if (m.version !== prop.base_version) throw new HttpError(409, "The module changed since this proposal was made. Re-import to see a fresh diff.");
    await db.update("modules", { id: m.id }, { content: prop.proposed, version: m.version + 1, status: "published", updated_at: new Date().toISOString() });
    await db.update("import_proposals", { id }, { status: "approved", decided_by: p.id, decided_at: new Date().toISOString() });
    await audit(p, "module.published", `M${prop.module_number}`, { version: m.version + 1 });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
