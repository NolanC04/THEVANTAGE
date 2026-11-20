import Link from "next/link";
export default function NotFound() {
  return (
    <section className="wrap pt-[150px] pb-[var(--section)] max-w-[760px]">
      <p className="eyebrow">Not found</p>
      <h1 className="h2 mt-6">This path doesn&apos;t lead anywhere yet.</h1>
      <Link className="btn-line mt-8" href="/">Back to The Vantage</Link>
    </section>
  );
}
