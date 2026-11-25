import "server-only";
import Stripe from "stripe";
import { env, ConfigError } from "./env";

let client: Stripe | null = null;
export function stripe() {
  if (!env.stripeSecret) throw new ConfigError("STRIPE_SECRET_KEY");
  client ??= new Stripe(env.stripeSecret);
  return client;
}
export const stripeTestMode = () => env.stripeSecret.startsWith("sk_test_") || !env.stripeSecret;
