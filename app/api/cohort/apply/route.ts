import { store } from "@/lib/store";
import { currentCohort } from "@/lib/content";
import { sendEmail, emailConfigured } from "@/lib/email";
import { env } from "@/lib/env";
import { ok, bad, fail, isEmail, str } from "@/lib/api";

const WHERE = ["Separating from the military within a year", "Veteran", "Civilian, building something", "Between chapters"];

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const full_name = str(b.full_name, 200), where_now = str(b.where_now, 100), intends_to_build = str(b.intends_to_build, 4000);
    if (!full_name) return bad("Full name is needed.");
    if (!isEmail(b.email)) return bad("That email doesn't look complete.");
    if (!WHERE.includes(where_now)) return bad("Choose where you are now.");
    if (!intends_to_build) return bad("Tell us what you intend to build.");
    const cohort = await currentCohort();
    await store().insert("cohort_applications", { cohort_id: cohort?.id ?? null, full_name, email: b.email.trim().toLowerCase(), where_now, intends_to_build });
    // Routes to Nolan only. No auto-reply or sales sequence to the applicant.
    if (emailConfigured() && env.inquiryTo) await sendEmail(env.inquiryTo, "New cohort application", `A new cohort application is waiting in the admin queue.\n\n${env.siteUrl}/admin`);
    return ok();
  } catch (e) {
    return fail(e);
  }
}
