import { moduleAccess, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  try {
    const { m, e } = await moduleAccess((await params).n);
    const choice = Number((await req.json()).choice);
    const options = m.content.quick_check?.options ?? [];
    if (!Number.isInteger(choice) || choice < 0 || choice >= options.length) throw new HttpError(400, "Pick one option.");
    if (e.quick_check != null) throw new HttpError(409, "Already locked.");
    await store().update("module_entries", { id: e.id }, { quick_check: choice });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
