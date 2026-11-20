import { store } from "@/lib/store";
import { sendEmail } from "@/lib/email";
import { env, ConfigError } from "@/lib/env";
import { ok, bad, fail, isEmail, str } from "@/lib/api";

// Inquiries route to Nolan only. No automatic sales email goes to the requester.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const name = str(b.name, 200), organization = str(b.organization, 200), outcome = str(b.outcome, 4000);
    if (!name) return bad("Your name is needed.");
    if (!organization) return bad("Organization is needed.");
    if (!isEmail(b.work_email)) return bad("That work email doesn't look complete.");
    if (!outcome) return bad("Tell us the outcome that matters most.");
    const row = await store().insert<{ id: string }>("org_inquiries", { name, organization, work_email: b.work_email.trim().toLowerCase(), outcome });
    if (!env.inquiryTo) throw new ConfigError("INQUIRY_TO_EMAIL");
    await sendEmail(env.inquiryTo, `Licensing inquiry: ${organization}`, `${name} (${b.work_email}) at ${organization}\n\nThe outcome that matters most:\n${outcome}\n\nRef ${row.id}`);
    return ok();
  } catch (e) {
    return fail(e);
  }
}
