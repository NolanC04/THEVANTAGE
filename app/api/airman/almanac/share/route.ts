import { signedIn, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const { n, shared } = await req.json();
    const hit = await store().update("module_entries", { user_id: p.id, module_number: Number(n) }, { shared: shared === true });
    if (!hit.length) throw new HttpError(404, "Entry not found.");
    return ok();
  } catch (e) {
    return fail(e);
  }
}
