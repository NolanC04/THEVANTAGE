import { currentMember, isAdmin } from "@/lib/auth";
import { publishDraft } from "@/lib/publish";
import { store } from "@/lib/store";
import { ok, bad, fail, str } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const member = await currentMember();
    if (!isAdmin(member)) return bad("Only Nolan can publish.", 403);
    const b = await req.json();
    const id = str(b.id, 80);
    if (b.action === "reject") {
      await store().update("import_drafts", { id, status: "draft" }, { status: "rejected" });
      return ok();
    }
    if (b.confirm !== true) return bad("Check the box to confirm you approve this release.");
    const author = str(b.author_of_record, 200);
    if (!author) return bad("Name the author of record.");
    const r = await publishDraft(id, member!.email, author);
    if (!r.published) return bad(`Publish blocked: ${r.findings.map((f) => `${f.field}: ${f.message}${f.match ? ` ("${f.match}")` : ""}`).join(" · ")}`, 422);
    return ok(r);
  } catch (e) {
    return fail(e);
  }
}
