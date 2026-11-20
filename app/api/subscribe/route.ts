import { randomBytes } from "crypto";
import { store } from "@/lib/store";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { ok, bad, fail, isEmail } from "@/lib/api";

// Double opt-in: the address is stored pending; only the emailed link confirms it.
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!isEmail(email)) return bad("That email doesn't look complete.");
    const token = randomBytes(24).toString("base64url");
    await store().upsert("subscribers", { email: email.trim().toLowerCase(), status: "pending", token }, "email");
    await sendEmail(
      email,
      "Confirm your subscription to The Vantage",
      `Confirm you want The Vantage newsletter:\n\n${env.siteUrl}/api/subscribe/confirm?token=${token}\n\nIf you didn't ask for this, ignore this email and nothing happens.`,
    );
    return ok();
  } catch (e) {
    return fail(e);
  }
}
