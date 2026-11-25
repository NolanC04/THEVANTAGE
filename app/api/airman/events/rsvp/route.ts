import { signedIn, HttpError } from "@/lib/airman/guard";
import { store } from "@/lib/airman/store";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    const { event_id, going } = await req.json();
    const db = store();
    const ev = await db.get<{ id: string; capacity: number | null }>("events", { id: event_id });
    if (!ev) throw new HttpError(404, "Event not found.");
    if (going) {
      if (await db.get("rsvps", { event_id, user_id: p.id })) return ok();
      if (ev.capacity != null && (await db.count("rsvps", { event_id })) >= ev.capacity) throw new HttpError(409, "This event is full.");
      await db.insert("rsvps", { event_id, user_id: p.id });
    } else await db.remove("rsvps", { event_id, user_id: p.id });
    return ok();
  } catch (e) {
    return fail(e);
  }
}
