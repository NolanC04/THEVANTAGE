import { signedIn, HttpError } from "@/lib/airman/guard";
import { entryOf } from "@/lib/airman/data";
import { store } from "@/lib/airman/store";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const b = await req.json();
    const d = Number(b.d) as 7 | 30;
    if (d !== 7 && d !== 30) throw new HttpError(400, "Unknown review.");
    const e = await entryOf(p.id, Number(b.n));
    if (!e?.sealed_at) throw new HttpError(404, "Seal the module first.");
    const answer = str(b.answer, 3000);
    if (!answer) throw new HttpError(400, "Answer from memory first.");
    if (e.reviews.some((r) => r.day === d)) throw new HttpError(409, "Already reviewed.");
    await store().update("module_entries", { id: e.id }, { reviews: [...e.reviews, { day: d, answer, at: new Date().toISOString() }] });
    return ok({ redirect: "/airman/app/almanac" });
  } catch (e) {
    return fail(e);
  }
}
