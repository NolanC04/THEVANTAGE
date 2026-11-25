import { signedIn, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const text = str((await req.json()).text, 1000);
    if (!text) throw new HttpError(400, "Write a line first.");
    const day = new Date().toISOString().slice(0, 10);
    if (await store().get("daily_reps", { user_id: p.id, day })) throw new HttpError(409, "Already logged today.");
    await store().insert("daily_reps", { user_id: p.id, day, text, at: new Date().toISOString() });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
