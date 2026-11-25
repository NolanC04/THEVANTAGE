import { signedIn } from "@/lib/airman/guard";
import { entriesOf, modules } from "@/lib/airman/data";
import { store } from "@/lib/airman/store";
import { code } from "@/lib/airman/program";
import { fail } from "@/lib/airman/api";

// The Airman's own export: "a translation layer, not a backup".
export async function GET(req: Request) {
  try {
    const p = await signedIn();
    const [entries, mods, reps] = await Promise.all([entriesOf(p.id), modules(), store().list<{ day: string; text: string }>("daily_reps", { user_id: p.id }, { column: "day" })]);
    const title = (n: number) => mods.find((m) => m.number === n)?.content.title ?? code(n);
    const sealed = entries.filter((e) => e.sealed_at);
    if (new URL(req.url).searchParams.get("format") === "json") {
      return new Response(JSON.stringify({ exported_at: new Date().toISOString(), entries: sealed.map((e) => ({ module: code(e.module_number), title: title(e.module_number), bridge: e.bridge, remix: e.remix, gene: e.gene, when: e.commitment_when, will: e.commitment_will, sealed_at: e.sealed_at, reviews: e.reviews })), daily_reps: reps }, null, 2), {
        headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="my-almanac.json"' },
      });
    }
    const text = ["MY ALMANAC · AAPEX", "", ...sealed.flatMap((e) => [`${code(e.module_number)} · ${title(e.module_number)} · sealed ${e.sealed_at?.slice(0, 10)}`, `Bridge: ${e.bridge}`, ...(e.remix ? [`Remix: ${e.remix}`] : []), ...e.gene.map((g) => `GENE: ${g.q}${g.a ? `\nMe: ${g.a}` : ""}`), ...(e.commitment_when ? [`When ${e.commitment_when}, I will ${e.commitment_will}.`] : []), ""]), "DAILY REPS", ...reps.map((r) => `${r.day}: ${r.text}`)].join("\n");
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": 'attachment; filename="my-almanac.txt"' } });
  } catch (e) {
    return fail(e);
  }
}
