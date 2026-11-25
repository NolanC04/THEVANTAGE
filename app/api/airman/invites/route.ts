import { randomInt } from "crypto";
import { signedIn, HttpError } from "@/lib/airman/guard";
import { canFacilitate, isAdmin, audit } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { classCode } from "@/lib/airman/access";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!canFacilitate(p)) throw new HttpError(403, "Facilitators only.");
    const b = await req.json();
    if (b.id) {
      await store().update("invites", { id: b.id }, { active: false });
      await audit(p, "invite.deactivated", b.id);
      return ok();
    }
    const role = String(b.role);
    const allowed = isAdmin(p) ? ["learner", "assistant", "comparison", "facilitator"] : ["learner", "comparison"];
    if (!allowed.includes(role)) throw new HttpError(403, "Only an admin grants that role.");
    const code = classCode(randomInt);
    const inv = await store().insert<{ id: string }>("invites", { code, role, unit: str(b.unit, 60) || null, flight: str(b.flight, 60) || null, class_id: null, created_by: p.id, active: true });
    await audit(p, "invite.created", inv.id, { role });
    return ok({ code });
  } catch (e) {
    return fail(e);
  }
}
