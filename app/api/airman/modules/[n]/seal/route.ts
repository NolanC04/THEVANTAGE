import { moduleAccess, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  try {
    const { e } = await moduleAccess((await params).n);
    if (!e.bridge_at) throw new HttpError(403, "Submit the Bridge before sealing.");
    if (e.sealed_at) throw new HttpError(409, "Already sealed.");
    const b = await req.json();
    await store().update("module_entries", { id: e.id }, { commitment_when: str(b.when, 300) || null, commitment_will: str(b.will, 300) || null, shared: b.shared === true, sealed_at: new Date().toISOString() });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
