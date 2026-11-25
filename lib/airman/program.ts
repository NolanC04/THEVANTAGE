// AAPEX structure: 24 modules, 3 phases of 8, 8 pilot sessions (session k = modules k, k+8, k+16).
export const PHASES = [
  { key: "shield", n: 1, name: "Resiliency", emblem: "Shield", light: "dawn" },
  { key: "sword", n: 2, name: "Efficacy", emblem: "Sword", light: "midday" },
  { key: "star", n: 3, name: "Polymathy", emblem: "Star", light: "dusk" },
] as const;
export type PhaseKey = (typeof PHASES)[number]["key"];
export const phaseOf = (n: number) => PHASES[Math.floor((n - 1) / 8)];
export const sessionOf = (n: number) => ((n - 1) % 8) + 1;
export const trio = (k: number) => [k, k + 8, k + 16];
export const SCENES = ["Well", "Aqueduct", "Stained glass", "Bridge", "Ship", "Hearth", "Scriptorium", "Temple"];
export const code = (n: number) => `M${String(n).padStart(2, "0")}`;
export const FIVE_CS = ["Character", "Competence", "Capability", "Cohesion", "Capacity"] as const;

/** The default 13-slide module map (approved design). Admin can edit per module. */
export const SLIDE_MAP: { n: number; screen: string; activity: null | "quick_check" | "roleplay" | "bridge" | "unveil" | "remix" | "gene" | "seal" | "interlude" }[] = [
  { n: 1, screen: "Hook", activity: null },
  { n: 2, screen: "Hook", activity: null },
  { n: 3, screen: "Expose", activity: null },
  { n: 4, screen: "Expose", activity: "quick_check" },
  { n: 5, screen: "Verse", activity: null },
  { n: 6, screen: "Verse", activity: null },
  { n: 7, screen: "Verse", activity: "roleplay" },
  { n: 8, screen: "Bridge", activity: "bridge" },
  { n: 9, screen: "Unveil", activity: "unveil" },
  { n: 10, screen: "Remix", activity: "remix" },
  { n: 11, screen: "GENE Outro", activity: "gene" },
  { n: 12, screen: "Almanac", activity: "seal" },
  { n: 13, screen: "Interlude", activity: "interlude" },
];
export const BRIDGE_SLIDE = 8;

export interface ModuleContent {
  title?: string;
  arc?: string;
  dlo?: string;
  method?: string;
  materials?: string;
  focus_skill?: string;
  unit_outcome?: string;
  daily_rep?: string;
  facilitator_opener?: string; // facilitator-only
  hook?: string;
  learn_md?: string;
  fieldwork?: string;
  prompts?: string[];
  reflect_prompt?: string; // the Bridge question
  debrief?: string[];
  summary?: string[];
  science?: string;
  selfdebrief?: string[];
  quote?: string;
  scene?: string;
  reads?: string;
  quick_check?: { question: string; options: string[] };
  roleplay?: { persona: string; hook: string; beats: string[]; resolution: string };
  closing_draft?: string; // compendium DRAFT: never shown to learners
}

export interface ModuleRow {
  id: string;
  number: number;
  phase: PhaseKey;
  session: number;
  content: ModuleContent;
  image_url: string | null; // seeded from docs/design/pilot-app/data.js (scripts/module-images.mjs)
  version: number;
  status: "draft" | "published";
  closing_law_id: string | null;
  updated_at: string;
}

/** Fields learners may receive. Facilitator opener and the closing draft never leave the server for learners. */
export const LEARNER_FIELDS: (keyof ModuleContent)[] = ["title", "arc", "dlo", "hook", "learn_md", "fieldwork", "prompts", "reflect_prompt", "summary", "quote", "scene", "reads", "quick_check", "roleplay", "daily_rep", "focus_skill"];
export const gap = (what: string) => `[NOLAN: ${what}]`;
