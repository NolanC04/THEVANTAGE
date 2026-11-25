import { moduleAccess, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { safetyHit } from "@/lib/airman/gene-rules";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  try {
    const { p, e, n } = await moduleAccess((await params).n);
    const answer = str((await req.json()).answer, 6000);
    if (!answer) throw new HttpError(400, "Write an answer first.");
    if (e.bridge_at) throw new HttpError(409, "Your Bridge answer is already submitted and frozen.");
    await store().update("module_entries", { id: e.id }, { bridge: answer, bridge_at: new Date().toISOString() });
    if (safetyHit(answer)) await store().insert("safety_flags", { user_id: p.id, anon_id: p.anon_id, module_number: n, source: "keyword", raised_at: new Date().toISOString(), followed_up_at: null, followed_up_by: null });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
