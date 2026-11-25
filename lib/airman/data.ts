import "server-only";
import { store } from "./store";
import type { Profile } from "./auth";
import type { ModuleRow } from "./program";
import { contentReadable, type ClassSession, type Join } from "./access";

export interface Settings { id: string; modules_readable_after_completion: boolean; daily_reps_between_sessions: boolean; report_threshold: number; rater_review_enabled: boolean; gene_kappa_target: number | null }
export interface Entry {
  id: string; user_id: string; module_number: number; bridge: string | null; bridge_at: string | null; remix: string | null;
  quick_check: number | null; gene: { q: string; a: string | null }[]; commitment_when: string | null; commitment_will: string | null;
  shared: boolean; sealed_at: string | null; reviews: { day: 7 | 30; answer: string; at: string }[];
}

export const settings = async () => (await store().get<Settings>("settings", { id: "settings" }))!;
export const modules = () => store().list<ModuleRow>("modules", undefined, { column: "number" });
export const moduleRow = (n: number) => store().get<ModuleRow>("modules", { number: n });
export const entryOf = (userId: string, n: number) => store().get<Entry>("module_entries", { user_id: userId, module_number: n });
export const entriesOf = (userId: string) => store().list<Entry>("module_entries", { user_id: userId }, { column: "module_number" });

export async function openSessions() {
  return (await store().list<ClassSession>("class_sessions")).filter((s) => !s.closed_at);
}

/** Server-side gate for module content (RLS mirrors this in Supabase). */
export async function canRead(p: Profile, n: number) {
  const [sessions, joins, s, e] = await Promise.all([openSessions(), store().list<Join>("class_joins", { user_id: p.id }), settings(), entryOf(p.id, n)]);
  return contentReadable(p, n, sessions, joins, { sealed: Boolean(e?.sealed_at), readableAfterCompletion: s.modules_readable_after_completion });
}

export async function ensureEntry(userId: string, n: number) {
  return (await entryOf(userId, n)) ?? store().insert<Entry>("module_entries", { user_id: userId, module_number: n, bridge: null, bridge_at: null, remix: null, quick_check: null, gene: [], commitment_when: null, commitment_will: null, shared: false, sealed_at: null, reviews: [] });
}
