export type Tier = "free" | "library" | "cohort" | "military";
export type Status = "draft" | "published";
export type Family = "The Self" | "The Mind" | "The Engine" | "The Structure" | "The Legacy";
export const FAMILIES: Family[] = ["The Self", "The Mind", "The Engine", "The Structure", "The Legacy"];

export interface Member {
  id: string;
  email: string;
  tier: Tier;
  verified_military: boolean;
  verification_type: "service_member" | "veteran" | "military_spouse" | null;
  verified_at: string | null;
  spouse_discount: boolean;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  created_at: string;
}

export interface Program {
  id: string;
  slug: string;
  word: string;
  acronym: string | null;
  family: Family | null; // null = flagship (AAPEX sits above the families)
  thesis: string | null;
  pain_line: string | null;
  tagline: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  release_no: number | null;
  release_label: string | null;
  status: Status;
  military_free: boolean;
  author_of_record: string | null;
  published_at: string | null;
}

export interface Module {
  id: string;
  program_id: string;
  number: number; // tracklist order
  title: string;
  phase: string | null; // AAPEX: Shield | Sword | Star
  cover_url: string | null;
  cover_alt: string | null;
  body_md: string | null;
  gene_question: string | null;
  minutes: number | null;
  status: Status;
  author_of_record: string | null;
  published_at: string | null;
}

export type LibraryKind = "video" | "article" | "book" | "newsletter" | "skill_sheet";
export const LIBRARY_KINDS: { kind: LibraryKind; label: string }[] = [
  { kind: "video", label: "Videos" },
  { kind: "article", label: "Articles" },
  { kind: "book", label: "Books" },
  { kind: "newsletter", label: "Newsletters" },
  { kind: "skill_sheet", label: "Skill sheets" },
];

export interface LibraryItem {
  id: string;
  kind: LibraryKind;
  slug: string;
  title: string;
  summary: string | null;
  body_md: string | null;
  url: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  tier_required: "public" | "free" | "library";
  status: Status;
  author_of_record: string | null;
  published_at: string | null;
}

export interface AlmanacEntry {
  id: string;
  member_id: string;
  program_slug: string;
  module_number: number;
  question: string;
  answer: string;
  gene_reply: string;
  sealed_at: string;
}

export interface DomeRow {
  member_id: string;
  given: string[];
  chosen: string[];
  updated_at: string;
}

export interface Purchase {
  id: string;
  member_id: string;
  kind: "library" | "cohort";
  stripe_session_id: string;
  cohort_id: string | null;
  amount_cents: number | null;
  status: "paid" | "refunded";
  created_at: string;
}

export interface Cohort {
  id: string;
  name: string;
  starts_on: string | null; // [NOLAN]
  info_session_on: string | null; // [NOLAN]
  seats: number;
  open: boolean;
}

export interface ImportDraft {
  id: string;
  package_id: string;
  version: number;
  schema: string;
  payload: unknown;
  received_at: string;
  status: "draft" | "published" | "rejected";
  published_by: string | null;
  published_at: string | null;
  target: string | null;
}
