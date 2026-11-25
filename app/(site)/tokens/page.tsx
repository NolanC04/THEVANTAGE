// Phase 0 check page: every approved token rendered, for a 390px no-horizontal-scroll test.
export const metadata = { title: "Tokens", robots: { index: false } };
const TOKENS = [
  ["ground", "#0D0B08"], ["surface", "#16130E"], ["gold", "#C8A45D"], ["text", "#EDE5D3"], ["body-muted", "#B3A993"],
  ["dim", "#8C8371"], ["rule", "#3A3222"], ["rule-faint", "#2A2418"], ["error", "#E2A58F"],
];
export default function Tokens() {
  return (
    <section className="wrap pt-[150px] pb-24">
      <p className="eyebrow">Theme tokens</p>
      <h1 className="display mt-6">Author the life you were built for.</h1>
      <h2 className="h2 mt-10">Section heading</h2>
      <p className="body mt-6">Body copy in Jost, 17px, line-height 1.8, body-muted.</p>
      <p className="quote text-[32px] mt-6">Italic quote in Cormorant.</p>
      <ul className="grid gap-4 mt-10 p-0 list-none" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(150px, 100%), 1fr))" }}>
        {TOKENS.map(([n, hex]) => (
          <li key={n}>
            <div className="h-16 border border-[var(--color-rule)]" style={{ background: hex }} />
            <p className="text-[13px] mt-2 mb-0">{n}</p>
            <p className="text-[12px] m-0" style={{ color: "var(--color-dim)" }}>{hex}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-6 mt-10"><a className="btn-gold" href="#">Primary</a><a className="btn-line" href="#">Outline</a></div>
      <div className="field mt-10 max-w-[420px]"><label htmlFor="t">Input</label><input id="t" /></div>
      <p className="error">Inline error text.</p>
    </section>
  );
}
