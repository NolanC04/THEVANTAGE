import { signedIn, HttpError } from "@/lib/airman/guard";
import { isAdmin, audit, type Profile } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { env } from "@/lib/airman/env";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!isAdmin(p)) throw new HttpError(403, "Only an admin changes access.");
    const { id, role } = await req.json();
    if (!["learner", "assistant", "comparison", "facilitator", "admin", "rater"].includes(role)) throw new HttpError(400, "Unknown role.");
    const target = await store().get<Profile>("profiles", { id });
    if (!target) throw new HttpError(404, "Not found.");
    if (target.email === env.adminEmail) throw new HttpError(403, "Nolan's own row is locked.");
    await store().update("profiles", { id }, { role });
    await audit(p, "access.changed", id, { from: target.role, to: role });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
