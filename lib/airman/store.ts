import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** The Airman Vantage shares The Vantage's database; every Airman table carries the airman_ prefix. */
export const dbTable = (t: string) => `airman_${t}`;
import { env, supabaseConfigured, devStoreAllowed, ConfigError } from "./env";
import { withRetry } from "./retry";
import { seedData } from "./seed";

export type TableName =
  | "profiles" | "invites" | "agreements" | "audit_log" | "settings"
  | "session_requests" | "request_messages"
  | "tracks" | "events" | "rsvps"
  | "modules" | "closing_laws" | "import_proposals"
  | "classes" | "class_members" | "class_sessions" | "class_joins"
  | "module_entries" | "observations" | "daily_reps" | "checkins" | "safety_flags"
  | "gene_reads" | "rater_scores" | "framework_entries";
type Row = Record<string, unknown>;
type Match = Record<string, string | number | boolean | null>;

/**
 * One data door. Supabase (service role, server only) when configured;
 * otherwise a local JSON file for development previews. RLS policies in
 * supabase/migrations protect direct API access; server code also filters by member.
 */
export interface Store {
  list<T>(table: TableName, match?: Match, order?: { column: string; ascending?: boolean }): Promise<T[]>;
  get<T>(table: TableName, match: Match): Promise<T | null>;
  insert<T>(table: TableName, row: Row): Promise<T>;
  update<T>(table: TableName, match: Match, patch: Row): Promise<T[]>;
  upsert<T>(table: TableName, row: Row, onConflict: string): Promise<T>;
  count(table: TableName, match?: Match): Promise<number>;
  remove(table: TableName, match: Match): Promise<number>;
}

let admin: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient {
  if (!supabaseConfigured()) throw new ConfigError("Supabase");
  admin ??= createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false } });
  return admin;
}


// PostgREST needs IS NULL for nulls; everything else is equality.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyMatch<Q extends { eq: any; is: any }>(q: Q, match?: Match): Q {
  if (!match) return q;
  for (const [k, v] of Object.entries(match)) q = v === null ? q.is(k, null) : q.eq(k, v);
  return q;
}

const supabaseStore: Store = {
  async list(table, match, order) {
    return withRetry(async () => {
      let q = supabaseAdmin().from(dbTable(table)).select("*");
      q = applyMatch(q, match);
      if (order) q = q.order(order.column, { ascending: order.ascending ?? true });
      const { data, error } = await q;
      if (error) throw new Error(`${table}: ${error.message}`);
      return (data ?? []) as never[];
    });
  },
  async get(table, match) {
    return withRetry(async () => {
      const { data, error } = await applyMatch(supabaseAdmin().from(dbTable(table)).select("*"), match).limit(1);
      if (error) throw new Error(`${table}: ${error.message}`);
      return ((data ?? [])[0] ?? null) as never;
    });
  },
  async insert(table, row) {
    return withRetry(async () => {
      const { data, error } = await supabaseAdmin().from(dbTable(table)).insert(row).select("*").single();
      if (error) throw new Error(`${table}: ${error.message}`);
      return data as never;
    });
  },
  async update(table, match, patch) {
    return withRetry(async () => {
      const { data, error } = await applyMatch(supabaseAdmin().from(dbTable(table)).update(patch), match).select("*");
      if (error) throw new Error(`${table}: ${error.message}`);
      return (data ?? []) as never[];
    });
  },
  async upsert(table, row, onConflict) {
    return withRetry(async () => {
      const { data, error } = await supabaseAdmin().from(dbTable(table)).upsert(row, { onConflict }).select("*").single();
      if (error) throw new Error(`${table}: ${error.message}`);
      return data as never;
    });
  },
  async count(table, match) {
    return withRetry(async () => {
      let q = supabaseAdmin().from(dbTable(table)).select("*", { count: "exact", head: true });
      q = applyMatch(q, match);
      const { count, error } = await q;
      if (error) throw new Error(`${table}: ${error.message}`);
      return count ?? 0;
    });
  },
  async remove(table, match) {
    return withRetry(async () => {
      const { data, error } = await applyMatch(supabaseAdmin().from(dbTable(table)).delete(), match).select("id");
      if (error) throw new Error(`${table}: ${error.message}`);
      return (data ?? []).length;
    });
  },
};

// ---------- development JSON store ----------
const file = path.join(process.cwd(), ".data", "airman.json"); // separate from The Vantage dev store
type Db = Record<string, Row[]>;
let chain: Promise<unknown> = Promise.resolve();

async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as Db;
  } catch {
    const db = seedData() as unknown as Db;
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(db, null, 2));
    return db;
  }
}
async function mutate<T>(fn: (db: Db) => T): Promise<T> {
  const run = chain.then(async () => {
    const db = await readDb();
    const out = fn(db);
    await fs.writeFile(file, JSON.stringify(db, null, 2));
    return out;
  });
  chain = run.catch(() => undefined);
  return run;
}
const matches = (row: Row, match?: Match) =>
  !match || Object.entries(match).every(([k, v]) => row[k] === v);

const devStore: Store = {
  async list(table, match, order) {
    const rows = ((await readDb())[table] ?? []).filter((r) => matches(r, match));
    if (order) {
      rows.sort((a, b) => {
        const x = a[order.column] as string | number, y = b[order.column] as string | number;
        return (x > y ? 1 : x < y ? -1 : 0) * (order.ascending === false ? -1 : 1);
      });
    }
    return rows as never[];
  },
  async get(table, match) {
    return (((await readDb())[table] ?? []).find((r) => matches(r, match)) ?? null) as never;
  },
  async insert(table, row) {
    return mutate((db) => {
      const full = { id: randomUUID(), created_at: new Date().toISOString(), ...row };
      (db[table] ??= []).push(full);
      return full as never;
    });
  },
  async update(table, match, patch) {
    return mutate((db) => {
      const hit = (db[table] ?? []).filter((r) => matches(r, match));
      hit.forEach((r) => Object.assign(r, patch));
      return hit as never[];
    });
  },
  async upsert(table, row, onConflict) {
    return mutate((db) => {
      const keys = onConflict.split(",").map((k) => k.trim());
      const rows = (db[table] ??= []);
      const existing = rows.find((r) => keys.every((k) => r[k] === row[k]));
      if (existing) {
        Object.assign(existing, row);
        return existing as never;
      }
      const full = { id: randomUUID(), created_at: new Date().toISOString(), ...row };
      rows.push(full);
      return full as never;
    });
  },
  async count(table, match) {
    return ((await readDb())[table] ?? []).filter((r) => matches(r, match)).length;
  },
  async remove(table, match) {
    return mutate((db) => {
      const before = (db[table] ?? []).length;
      db[table] = (db[table] ?? []).filter((r) => !matches(r, match));
      return before - db[table].length;
    });
  },
};

export function store(): Store {
  if (supabaseConfigured()) return supabaseStore;
  if (devStoreAllowed()) return devStore;
  throw new ConfigError("Supabase (production requires it)");
}

export const usingDevStore = () => !supabaseConfigured();
