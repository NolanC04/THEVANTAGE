import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { publishedPrograms, publishedLibrary } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = ["", "/programs", "/library", "/cohort", "/organizations", "/military", "/newsletter", "/join", "/begin"].map((p) => ({ url: env.siteUrl + p }));
  try {
    const [programs, items] = await Promise.all([publishedPrograms(), publishedLibrary()]);
    return [...base, ...programs.map((p) => ({ url: `${env.siteUrl}/programs/${p.slug}` })), ...items.map((i) => ({ url: `${env.siteUrl}/library/${i.slug}` }))];
  } catch {
    return base;
  }
}
