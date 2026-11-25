// AAPEX materials never mention The Vantage (Nolan, 21 Nov 2026). Word match, so "advantage" passes.
export const VANTAGE = /\bvantage\b/i;
export const mentionsVantage = (v: unknown) => VANTAGE.test(typeof v === "string" ? v : JSON.stringify(v ?? ""));
