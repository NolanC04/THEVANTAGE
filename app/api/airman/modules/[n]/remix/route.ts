import { moduleAccess, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  try {
    const { e } = await moduleAccess((await params).n);
    if (!e.bridge_at) throw new HttpError(403, "Submit the Bridge first.");
    if (e.sealed_at) throw new HttpError(409, "This module is sealed.");
    const text = str((await req.json()).text, 6000);
    if (!text) throw new HttpError(400, "Write the remix first.");
    await store().update("module_entries", { id: e.id }, { remix: text });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
