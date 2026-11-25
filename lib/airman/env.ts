export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  adminEmail: (process.env.APEX_ADMIN_EMAIL ?? "").toLowerCase(),
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5",
  resendKey: process.env.RESEND_API_KEY ?? "",
  notifyFrom: process.env.NOTIFY_FROM ?? "",
  discordInvite: process.env.DISCORD_INVITE_URL ?? "",
  importSecret: process.env.APEX_IMPORT_SECRET ?? "",
  signetopsRawBase: process.env.SIGNETOPS_RAW_BASE ?? "https://raw.githubusercontent.com/NolanC04/SIGNETOPS/main",
  githubToken: process.env.GITHUB_TOKEN ?? "",
  // Pin GENE's prompt to a SIGNETOPS commit for the pilot. "main" means the prompt can change mid-cohort.
  genePromptRef: process.env.GENE_PROMPT_REF ?? "",
  geneRubricVersion: process.env.GENE_RUBRIC_VERSION ?? "unversioned",
};
/** SIGNETOPS_RAW_BASE ends in a ref (default /main). GENE_PROMPT_REF, when set, replaces that ref. */
export const genePromptRef = () => env.genePromptRef || env.signetopsRawBase.split("/").pop() || "main";
export const genePromptBase = () => (env.genePromptRef ? env.signetopsRawBase.replace(/\/[^/]+$/, `/${env.genePromptRef}`) : env.signetopsRawBase);
export const supabaseConfigured = () => Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceKey);
export const devStoreAllowed = () => process.env.NODE_ENV !== "production" || process.env.APEX_ALLOW_DEV_STORE === "1";
export class ConfigError extends Error {
  constructor(public missing: string) {
    super(`Not configured: ${missing}. Add it to the environment (see .env.example).`);
  }
}
