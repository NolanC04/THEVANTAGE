export default function Loading() {
  return (
    <section className="wrap pt-[150px] pb-[var(--section)]" aria-busy="true">
      <p className="eyebrow">Loading</p>
      <div className="mt-8 h-px w-40" style={{ background: "var(--color-gold)" }} />
    </section>
  );
}
