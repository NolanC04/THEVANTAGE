import { currentMember } from "@/lib/auth";
import { store } from "@/lib/store";
import { ok, bad, fail } from "@/lib/api";

const lines = (v: unknown) =>
  (typeof v === "string" ? v.split("\n") : []).map((s) => s.trim()).filter(Boolean).slice(0, 24).map((s) => s.slice(0, 120));

export async function POST(req: Request) {
  try {
    const member = await currentMember();
    if (!member) return bad("Sign in first.", 401);
    const body = await req.json();
    await store().upsert("dome", { member_id: member.id, given: lines(body.given), chosen: lines(body.chosen), updated_at: new Date().toISOString() }, "member_id");
    return ok();
  } catch (e) {
    return fail(e);
  }
}
