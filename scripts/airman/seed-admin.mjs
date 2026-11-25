// Supabase seed: makes APEX_ADMIN_EMAIL an admin (the app also does this on that account's first sign-in).
import { createClient } from "@supabase/supabase-js";
const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, APEX_ADMIN_EMAIL: email } = process.env;
if (!url || !key || !email) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APEX_ADMIN_EMAIL");
const sb = createClient(url, key);
const { data, error } = await sb.from("airman_profiles").update({ role: "admin" }).eq("email", email.toLowerCase()).select("id");
if (error) throw error;
console.log(data.length ? `${email} is admin` : `${email} has not signed in yet; first sign-in makes them admin`);
