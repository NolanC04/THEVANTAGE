import { signedIn, HttpError } from "@/lib/airman/guard";
import { isAdmin, audit } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { ok, fail } from "@/lib/airman/api";
import { rubricWritten } from "@/lib/airman/validation";
export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!isAdmin(p)) throw new HttpError(403, "Admins only.");
    const b = await req.json();
    const patch: Record<string, boolean | number | null> = {};
    for (const k of ["modules_readable_after_completion", "daily_reps_between_sessions", "rater_review_enabled"]) if (typeof b[k] === "boolean") patch[k] = b[k];
    if (patch.rater_review_enabled === true && !rubricWritten()) throw new HttpError(409, "Write the rubric anchors in lib/validation.ts before opening rater review.");
    if ("gene_kappa_target" in b) {
      const t = b.gene_kappa_target === "" || b.gene_kappa_target == null ? null : Number(b.gene_kappa_target);
      if (t !== null && !(t > 0 && t <= 1)) throw new HttpError(400, "Target must be between 0 and 1.");
      patch.gene_kappa_target = t;
    }
    await store().update("settings", { id: "settings" }, patch);
    await audit(p, "settings.changed", "settings", patch);
    return ok();
  } catch (e) {
    return fail(e);
  }
}
