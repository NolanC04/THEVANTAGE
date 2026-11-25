import { randomInt } from "crypto";
import { signedIn, HttpError } from "@/lib/airman/guard";
import { canFacilitate, audit } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { classCode } from "@/lib/airman/access";
import { trio } from "@/lib/airman/program";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!canFacilitate(p)) throw new HttpError(403, "Facilitators only.");
    const b = await req.json();
    const k = Number(b.session);
    const mods = k >= 1 && k <= 8 ? trio(k) : String(b.modules ?? "").split(/[\s,]+/).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 24);
    if (!mods.length) throw new HttpError(400, "Pick a session or list modules.");
    const db = store();
    let code = classCode(randomInt);
    while (await db.get("class_sessions", { code, closed_at: null })) code = classCode(randomInt);
    const s = await db.insert<{ id: string }>("class_sessions", { class_id: null, code, module_numbers: [...new Set(mods)].sort((a, b) => a - b), opened_by: p.id, opened_at: new Date().toISOString(), closed_at: null });
    await audit(p, "class.started", s.id, { code, modules: mods });
    return ok({ id: s.id, code });
  } catch (e) {
    return fail(e);
  }
}
