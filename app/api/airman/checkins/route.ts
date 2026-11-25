import { signedIn, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { MEASURES, WAVES } from "@/lib/airman/measures";
import { AGREEMENT_VERSION } from "@/lib/airman/agreement";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const { wave, responses } = await req.json();
    if (!WAVES.some((w) => w[0] === wave)) throw new HttpError(400, "Unknown wave.");
    if (!(await store().get("agreements", { user_id: p.id, version: AGREEMENT_VERSION }))) throw new HttpError(403, "Sign the agreement first.");
    if (await store().get("checkins", { user_id: p.id, wave })) throw new HttpError(409, "Already done.");
    const clean: Record<string, number[]> = {};
    for (const m of MEASURES) {
      const arr = responses?.[m.id];
      if (!Array.isArray(arr) || arr.length !== m.items.length || arr.some((v: unknown) => !Number.isInteger(v) || (v as number) < m.min || (v as number) > m.max))
        throw new HttpError(400, `${m.name}: answer every item.`);
      clean[m.id] = arr;
    }
    await store().insert("checkins", { user_id: p.id, anon_id: p.anon_id, group: p.role === "comparison" ? "comparison" : "cohort", wave, responses: clean, at: new Date().toISOString() });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
