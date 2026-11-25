import { currentProfile } from "@/lib/airman/auth";
import { entriesOf, modules } from "@/lib/airman/data";
import { reflectionFor } from "@/lib/airman/reflection";
import { PHASES, code, phaseOf } from "@/lib/airman/program";
import { Painting } from "@/components/airman/Painting";
import { AlmanacTools, ShareToggle, Reflection } from "./Tools";
import { airmanFrameworkEntries } from "@/lib/frameworks/entries";
import { frameworkById } from "@/lib/frameworks/registry";

export default async function Almanac() {
  const p = (await currentProfile())!;
  const [entries, mods, reflection, frameworks] = await Promise.all([entriesOf(p.id), modules(), reflectionFor(p.id), airmanFrameworkEntries(p.id)]);
  const sealed = entries.filter((e) => e.sealed_at);
  const title = (n: number) => mods.find((m) => m.number === n)?.content.title ?? code(n);
  const painting = (n: number) => mods.find((m) => m.number === n)?.image_url ?? null;
  return (
    <main className="page" style={{ display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 22, margin: "8px 0 0" }}>Your Almanac</h1>
      <p className="help" style={{ margin: 0 }}>Only you read this. A facilitator sees an entry only if you share it. {sealed.length} of {mods.length} sealed.</p>
      {reflection && <Reflection id={reflection.id} text={reflection.text} />}
      {PHASES.map((ph) => {
        const list = sealed.filter((e) => phaseOf(e.module_number).key === ph.key);
        if (!list.length) return null;
        return (
          <section key={ph.key} style={{ display: "grid", gap: 10 }}>
            <h2 style={{ fontSize: 16, margin: "8px 0 0" }}>The {ph.emblem} · {ph.name}</h2>
            {list.map((e) => (
              <article key={e.id} className="card" style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Painting src={painting(e.module_number)} variant="seal" emblem={ph.emblem} />
                  <div><div className="k">{code(e.module_number)} · sealed {new Date(e.sealed_at!).toLocaleDateString()}</div><div className="serif" style={{ fontSize: 18 }}>{title(e.module_number)}</div></div>
                </div>
                <p style={{ margin: 0 }}><b>Bridge.</b> {e.bridge}</p>
                {e.remix && <p style={{ margin: 0 }}><b>Remix.</b> {e.remix}</p>}
                {e.gene.map((g, k) => <p key={k} className="serif" style={{ margin: 0, paddingLeft: 10, borderLeft: "2px solid var(--color-primary)" }}>{g.q}{g.a ? <><br /><span style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>{g.a}</span></> : null}</p>)}
                {e.commitment_when && <p style={{ margin: 0 }}><i>When {e.commitment_when}, I will {e.commitment_will}.</i></p>}
                {e.reviews.map((r) => <p key={r.day} className="help" style={{ margin: 0 }}>Day {r.day} review: {r.answer}</p>)}
                <ShareToggle n={e.module_number} shared={e.shared} />
              </article>
            ))}
          </section>
        );
      })}
      {!sealed.length && <p className="card">Nothing sealed yet. Each module you seal lands here.</p>}
      {frameworks.length > 0 && (
        <section style={{ display: "grid", gap: 10 }}>
          <h2 style={{ fontSize: 16, margin: "8px 0 0" }}>Practice you saved</h2>
          {frameworks.map((e) => {
            const f = frameworkById(e.framework_id);
            if (!f) return null;
            return (
              <article key={e.framework_id} className="card" style={{ display: "grid", gap: 6 }}>
                <div className="k">{e.module_number ? `${code(e.module_number)} · ` : ""}saved {new Date(e.saved_at).toLocaleDateString()}</div>
                <a className="serif" style={{ fontSize: 18 }} href={e.module_number ? `/airman/app/m/${e.module_number}#${f.id}` : "#"}>{f.title}</a>
                {e.summary && <p style={{ margin: 0 }}>{e.summary}</p>}
              </article>
            );
          })}
          <p className="help" style={{ margin: 0 }}>Saved practice stays private to you. It is never shared with a facilitator.</p>
        </section>
      )}
      <AlmanacTools />
    </main>
  );
}
