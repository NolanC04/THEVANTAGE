import "server-only";
import { currentProfile, type Profile } from "./auth";
import { canRead, moduleRow, ensureEntry, type Entry } from "./data";
import type { ModuleRow } from "./program";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
export async function signedIn() {
  const p = await currentProfile();
  if (!p) throw new HttpError(401, "Sign in first.");
  return p;
}
/** Every module API passes through here: signed in, module exists, class wall open. */
export async function moduleAccess(nRaw: string): Promise<{ p: Profile; m: ModuleRow; e: Entry; n: number }> {
  const p = await signedIn();
  const n = Number(nRaw);
  const m = Number.isInteger(n) ? await moduleRow(n) : null;
  if (!m) throw new HttpError(404, "Module not found.");
  if (!(await canRead(p, n))) throw new HttpError(403, "This module opens in class.");
  return { p, m, n, e: await ensureEntry(p.id, n) };
}
