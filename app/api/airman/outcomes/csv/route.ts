import { signedIn, HttpError } from "@/lib/airman/guard";
import { canFacilitate } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { toCSV, type CheckinRow } from "@/lib/airman/measures";
import { fail } from "@/lib/airman/api";
export async function GET() {
  try {
    const p = await signedIn();
    if (!canFacilitate(p)) throw new HttpError(403, "Facilitators only.");
    const csv = toCSV(await store().list<CheckinRow>("checkins"));
    return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="aapex-outcomes.csv"' } });
  } catch (e) {
    return fail(e);
  }
}
