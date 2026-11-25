import { signedIn } from "@/lib/airman/guard";
import { isAdmin } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { ok, bad, fail } from "@/lib/airman/api";
import { cleanSave } from "@/lib/frameworks/save";

// Saves a framework to the Airman's own Almanac. Owner-only in RLS; never shared with facilitators.
export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const c = cleanSave(await req.json(), isAdmin(p));
    if (!c.ok) return bad(c.error, c.status);
    const saved_at = new Date().toISOString();
    await store().upsert("framework_entries", { user_id: p.id, ...c.value, saved_at }, "user_id,framework_id");
    return ok({ saved_at });
  } catch (e) {
    return fail(e);
  }
}
