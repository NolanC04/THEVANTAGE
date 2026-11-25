// Seed content: only what the approved canvas (docs/design/canvas) states. No invented module content.
import type { Program, Module, Cohort, LibraryItem } from "./types";

const P = "/images/paintings/";
const AAPEX_ID = "prog-aapex";
const OWNERSHIP_ID = "prog-ownership";

// Titles and painting mapping exactly as docs/design/canvas/Programs.html.
const TRACKS: [number, string, string | null, string | null][] = [
  [1, "Gratitude", null, null],
  [2, "Value Based Goals", "brass-compass-on-stone.jpg", "A brass compass on stone"],
  [3, "Your Strengths", "hand-gripping-stone-hammer.jpg", "A hand gripping a stone hammer against rock"],
  [4, "Reframe", "shattered-gilt-mirror.jpg", "A shattered gilt mirror struck by a beam of light"],
  [5, "Balance Your Thinking", "brass-scales-candlelight.jpg", "Brass balance scales in candlelight"],
  [6, "Social Capital", "hands-clasped-against-stone.jpg", "Two hands clasped against stone"],
  [7, "Mindfulness", "candle-on-stone.jpg", "A single candle burning on stone"],
  [8, "Physical Resilience", "figure-lit-from-one-side.jpg", "A muscular figure lit from one side"],
  [9, "Authenticity Impact", "figure-doorway-golden-light.jpg", "A figure in a doorway of light"],
  [10, "Aligned Systems", "stone-steps-lit-doorway.jpg", "Stone steps rising to a lit doorway"],
  [11, "Unique Value", "iron-key-on-marble.jpg", "An iron key on marble"],
  [12, "Difficult Conversations", "two-men-stone-hall.jpg", "Two men facing each other in a dark hall"],
  [13, "Influencing Thought", "open-book-blank-pages.jpg", "An open book with blank pages"],
  [14, "Inner Circle", "hands-cupped-warm-glow.jpg", "Hands cupped together around a glow"],
  [15, "Thinking on Paper", "quill-ink-parchment.jpg", "A quill and ink on parchment"],
  [16, "Pillars of Fitness", "velvet-chaise-stone-room.jpg", "A velvet chaise in a sunlit stone room"],
  [17, "Identity Development", "smith-forging-golden-figure.jpg", "A smith forging a golden figure at the anvil"],
  [18, "Life Path Projection", "mountain-path-golden-peaks.jpg", "A mountain path toward golden peaks"],
  [19, "Cross-Domain Integration", "ruined-aqueducts.jpg", "Ruined aqueducts crossing one another"],
  [20, "Leading Conversation", "leader-before-company.jpg", "A leader standing before a gathered company"],
  [21, "Original Thinking", "ridge-first-light.jpg", "A figure watching sunrise from a ridge"],
  [22, "Community Cultivation", "circle-planting-seedling.jpg", "A circle of people planting a seedling together"],
  [23, "Intentional Authoring", "open-book-quill.jpg", "An open book with a quill across its pages"],
  [24, "Physical Asset", "crag-misted-valley-aqueduct.jpg", "A figure above a misted valley with an aqueduct"],
];

export const PHASES = [
  { key: "Shield", numeral: "I", label: "I · The Shield", name: "Foundational Resiliency", short: "Resiliency", line: "Hold steady while everything moves.", from: 1, to: 8 },
  { key: "Sword", numeral: "II", label: "II · The Sword", name: "Efficacy Impacts", short: "Efficacy", line: "Act with intent, under pressure.", from: 9, to: 16 },
  { key: "Star", numeral: "III", label: "III · The Star", name: "Polymathy", short: "Polymathy", line: "Build across every part of your life.", from: 17, to: 24 },
] as const;

export const phaseFor = (n: number) => PHASES.find((p) => n >= p.from && n <= p.to)!;

const SEEDED = "2026-11-19T00:00:00.000Z";

export function seedData() {
  const programs: Program[] = [
    {
      id: AAPEX_ID,
      slug: "aapex",
      word: "AAPEX",
      acronym: null, // [NOLAN: expansion of the acronym]
      family: null,
      thesis: "Twenty-four modules. Three movements. One method.",
      pain_line: null,
      tagline: "Every module is a painting, a principle and a practice. The first one is free.",
      cover_url: P + "figure-doorway-golden-light.jpg",
      cover_alt: "A figure standing in a doorway of golden light",
      release_no: 1,
      release_label: "Release 01 · Out now",
      status: "published",
      military_free: true,
      author_of_record: "Nolan Langford",
      published_at: SEEDED,
    },
    {
      id: OWNERSHIP_ID,
      slug: "ownership",
      word: "OWNERSHIP",
      acronym: null,
      family: null, // [NOLAN: family]
      thesis: null,
      pain_line: null,
      tagline: "Members hear every release first. Their Almanac carries across all of them.",
      cover_url: null,
      cover_alt: null,
      release_no: 2,
      release_label: "Release 02 · [NOLAN: release date]",
      status: "draft",
      military_free: false,
      author_of_record: null,
      published_at: null,
    },
  ];
  const modules: Module[] = TRACKS.map(([n, title, img, alt]) => ({
    id: `mod-aapex-${n}`,
    program_id: AAPEX_ID,
    number: n,
    title,
    phase: phaseFor(n).key,
    cover_url: img ? P + img : null,
    cover_alt: alt,
    body_md: null, // arrives from Studiolo as an approved release
    gene_question: null,
    minutes: null,
    status: "published",
    author_of_record: "Nolan Langford",
    published_at: SEEDED,
  }));
  const cohorts: Cohort[] = [
    { id: "cohort-founding", name: "Founding cohort", starts_on: null, info_session_on: null, seats: 20, open: true },
  ];
  const library_items: LibraryItem[] = [];
  return {
    members: [],
    programs,
    modules,
    library_items,
    almanac_entries: [],
    dome: [],
    purchases: [],
    cohorts,
    cohort_applications: [],
    org_inquiries: [],
    subscribers: [],
    import_drafts: [],
    publish_log: [],
  };
}
