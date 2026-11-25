import type { Profile } from "./auth";
import { BRIDGE_SLIDE } from "./program";

export interface ClassSession { id: string; class_id: string | null; code: string; module_numbers: number[]; opened_by: string; opened_at: string; closed_at: string | null }
export interface Join { class_session_id: string; user_id: string }

/**
 * Class-only wall (Phase 6). Module content is readable only while the learner has joined an OPEN class
 * session that includes the module. Staff (assistant, facilitator, admin) bypass. After a session closes,
 * content locks again unless the setting allows completed (sealed) modules to stay readable.
 */
export function contentReadable(p: Profile, moduleNumber: number, sessions: ClassSession[], joins: Join[], opts: { sealed: boolean; readableAfterCompletion: boolean }) {
  if (p.role === "admin" || p.role === "facilitator" || p.role === "assistant") return true;
  if (p.role === "comparison") return false;
  const open = new Set(sessions.filter((s) => !s.closed_at && s.module_numbers.includes(moduleNumber)).map((s) => s.id));
  if (joins.some((j) => j.user_id === p.id && open.has(j.class_session_id))) return true;
  return opts.sealed && opts.readableAfterCompletion;
}

/** Bridge gate (Phase 10): slides after the Bridge stay locked until the Bridge answer is submitted. */
export const slideReadable = (slide: number, bridgeSubmitted: boolean) => slide <= BRIDGE_SLIDE || bridgeSubmitted;

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const classCode = (rand: (n: number) => number) => Array.from({ length: 6 }, () => ALPHA[rand(ALPHA.length)]).join("");
