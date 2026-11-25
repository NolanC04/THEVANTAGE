"use client";
/** Plain-voice failure with Retry. Shown after one silent retry has already failed. A failed load never renders as empty data. */
export function LoudError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="card" style={{ borderColor: "#8a2d1c" }}>
      <p style={{ margin: 0, fontWeight: 600 }}>That didn&apos;t load.</p>
      <p className="help" style={{ margin: "6px 0 12px" }}>{message}</p>
      <button className="btn-ghost" onClick={onRetry}>Retry</button>
    </div>
  );
}
