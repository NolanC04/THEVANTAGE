import { currentMember, isAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { ok, bad, fail } from "@/lib/api";
import { cleanSave } from "@/lib/frameworks/save";

// Saves a framework to the member's own Almanac. Owner-only in RLS; this route only ever writes the signed-in member's row.
export async function POST(req: Request) {
  try {
    const member = await currentMember();
    if (!member) return bad("Sign in to save to your Almanac.", 401);
    const c = cleanSave(await req.json(), isAdmin(member));
    if (!c.ok) return bad(c.error, c.status);
    const saved_at = new Date().toISOString();
    await store().upsert("framework_entries", { member_id: member.id, ...c.value, saved_at }, "member_id,framework_id");
    return ok({ saved_at });
  } catch (e) {
    return fail(e);
  }
}
