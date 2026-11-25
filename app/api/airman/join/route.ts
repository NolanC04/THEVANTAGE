import { signedIn, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import type { ClassSession } from "@/lib/airman/access";
import { ok, fail, str } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const code = str((await req.json()).code, 6).toUpperCase();
    const s = await store().get<ClassSession>("class_sessions", { code });
    if (!s || s.closed_at) throw new HttpError(404, "That class code isn't open.");
    if (!(await store().get("class_joins", { class_session_id: s.id, user_id: p.id })))
      await store().insert("class_joins", { class_session_id: s.id, user_id: p.id, joined_at: new Date().toISOString() });
    return ok({ redirect: `/airman/app/m/${Math.min(...s.module_numbers)}` });
  } catch (e) {
    return fail(e);
  }
}
