import { signedIn, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail } from "@/lib/airman/api";

// Recognition scoring: the learner rates a surfaced reflection True / Partly true / Not true.
export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const { id, rating } = await req.json();
    if (!["true", "partly", "not"].includes(rating)) throw new HttpError(400, "Choose one.");
    const hit = await store().update("observations", { id, user_id: p.id }, { rating, rated_at: new Date().toISOString() });
    if (!hit.length) throw new HttpError(404, "Not found.");
    return ok();
  } catch (e) {
    return fail(e);
  }
}
