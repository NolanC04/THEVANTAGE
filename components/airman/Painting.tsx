// Module paintings (public/images/modules/AAPEX_M##.png). The current files are 199×112, so no variant
// draws them larger than their natural width: tiles and seals stay at or below natural size, and the
// slide-player hero caps the width and fades the edges into the dark slide with a scrim.
export const NATURAL = { w: 199, h: 112 };

// TODO(paintings): when higher-resolution files replace these under the same names, set
// HERO_FULL_BLEED = true (and raise NATURAL) so the hero fills the slide edge to edge.
export const HERO_FULL_BLEED = false;

export function Painting({ src, variant, dim = false, emblem }: { src: string | null; variant: "tile" | "hero" | "seal"; dim?: boolean; emblem?: string }) {
  if (!src) return null;
  if (variant === "seal")
    return (
      // 56×56 crop: always a downscale (112px tall source).
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={emblem ? `${emblem} seal` : ""} width={56} height={56} style={{ flex: "none", width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1px solid var(--color-border)" }} />
    );
  if (variant === "tile")
    return (
      // Natural size or smaller, centered in the tile.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" width={NATURAL.w} height={NATURAL.h} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: `min(100%, ${NATURAL.w}px)`, height: "auto", opacity: 0.6 }} />
    );
  if (HERO_FULL_BLEED)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: dim ? 0.25 : 0.85 }} />;
  return (
    <div aria-hidden="true" style={{ position: "absolute", top: "7%", left: "50%", transform: "translateX(-50%)", width: `min(100% - 32px, ${NATURAL.w}px)`, opacity: dim ? 0.3 : 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={NATURAL.w} height={NATURAL.h} style={{ display: "block", width: "100%", height: "auto" }} />
      {/* Dark scrim: feathers the painting into the slide so its edges never read as a hard, upscaled rectangle. */}
      <div style={{ position: "absolute", inset: -1, background: "radial-gradient(ellipse at center, rgba(31,58,46,0) 45%, rgba(31,58,46,.65) 80%, rgba(31,58,46,1) 100%)" }} />
    </div>
  );
}
