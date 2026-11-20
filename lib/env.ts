// Central env access. Missing values are reported, never guessed.
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  adminEmail: (process.env.VANTAGE_ADMIN_EMAIL ?? "").toLowerCase(),
  stripeSecret: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  priceLibrary: process.env.STRIPE_PRICE_LIBRARY_MONTHLY ?? "",
  priceCohort: process.env.STRIPE_PRICE_COHORT ?? "",
  priceCohortFounding: process.env.STRIPE_PRICE_COHORT_FOUNDING ?? "",
  couponSpouse: process.env.STRIPE_COUPON_MILITARY_SPOUSE ?? "",
  idmeClientId: process.env.IDME_CLIENT_ID ?? "",
  idmeClientSecret: process.env.IDME_CLIENT_SECRET ?? "",
  idmeEnv: process.env.IDME_ENV === "production" ? "production" : "sandbox",
  resendKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  inquiryTo: process.env.INQUIRY_TO_EMAIL ?? "",
  importSecret: process.env.VANTAGE_IMPORT_SECRET ?? "",
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5",
  signetopsRawBase:
    process.env.SIGNETOPS_RAW_BASE ?? "https://raw.githubusercontent.com/NolanC04/SIGNETOPS/main",
  githubToken: process.env.GITHUB_TOKEN ?? "",
};

export const supabaseConfigured = () =>
  Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceKey);

/** The local JSON store is a development convenience only. Production must use Supabase. */
export const devStoreAllowed = () => process.env.NODE_ENV !== "production" || process.env.VANTAGE_ALLOW_DEV_STORE === "1";

export class ConfigError extends Error {
  constructor(public missing: string) {
    super(`Not configured: ${missing}. Add it to the environment (see .env.example).`);
  }
}
