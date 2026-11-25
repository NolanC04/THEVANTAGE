import { signedIn, HttpError } from "@/lib/airman/guard";
import { canFacilitate, type Profile } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { notify, staffEmails } from "@/lib/airman/notify";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const b = await req.json();
    const db = store();
    const r = await db.get<{ id: string; user_id: string }>("session_requests", { id: b.request_id });
    if (!r || (r.user_id !== p.id && !canFacilitate(p))) throw new HttpError(404, "Request not found.");
    const body = str(b.body, 4000);
    if (!body) throw new HttpError(400, "Write a reply first.");
    await db.insert("request_messages", { request_id: r.id, author_id: p.id, author_role: p.id === r.user_id ? "learner" : "staff", body, at: new Date().toISOString() });
    const requester = await db.get<Profile>("profiles", { id: r.user_id });
    const to = p.id === r.user_id ? await staffEmails() : requester ? [requester.email] : [];
    await notify(to, `/airman/app/community/requests/${r.id}`);
    return ok();
  } catch (e) {
    return fail(e);
  }
}
