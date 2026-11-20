"use client";
// Loud failure: the server already retried once silently; this is the visible message with Retry.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const notConfigured = error.message.startsWith("Not configured");
  return (
    <section className="wrap pt-[150px] pb-[var(--section)] max-w-[760px]">
      <p className="eyebrow">Something didn&apos;t load</p>
      <h1 className="h2 mt-6">This page couldn&apos;t reach its records.</h1>
      <p className="body mt-6">{notConfigured ? error.message : "Nothing is lost. Try again in a moment."}</p>
      <button className="btn-gold mt-8" onClick={reset}>Retry</button>
    </section>
  );
}
