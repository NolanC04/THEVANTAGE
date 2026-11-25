import { signedIn, HttpError } from "@/lib/airman/guard";
import { canFacilitate, audit } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { ok, fail } from "@/lib/airman/api";
export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!canFacilitate(p)) throw new HttpError(403, "Facilitators only.");
    const { id } = await req.json();
    await store().update("safety_flags", { id }, { followed_up_at: new Date().toISOString(), followed_up_by: p.anon_id });
    await audit(p, "safety_flag.followed_up", id);
    return ok();
  } catch (e) {
    return fail(e);
  }
}
