import "server-only";
import { store } from "./store";
import { shouldReflect } from "./gene-rules";

interface Obs { id: string; user_id: string; text: string; rating: "true" | "partly" | "not" | null; surfaced: boolean; at: string }

/** At most one reflection per turn (page view), following the 70% cadence rule. */
export async function reflectionFor(userId: string): Promise<Obs | null> {
  const all = await store().list<Obs>("observations", { user_id: userId }, { column: "at" });
  const pending = all.find((o) => o.surfaced && o.rating == null);
  if (pending) return pending;
  const ratings = all.filter((o) => o.rating).map((o) => o.rating!) as ("true" | "partly" | "not")[];
  if (!shouldReflect(all.length, ratings)) return null;
  const next = [...all].reverse().find((o) => !o.surfaced && o.text);
  if (!next) return null;
  await store().update("observations", { id: next.id }, { surfaced: true });
  return next;
}
