import "server-only";
import { env } from "@/lib/env";
import { createStubProvider } from "./stub";
import type { BillingProvider } from "./types";

/**
 * The active billing provider. Only the stub exists today; a Paddle or Lemon
 * Squeezy provider implements the same BillingProvider interface and is
 * returned here instead.
 */
export function getBillingProvider(): BillingProvider {
  return createStubProvider({ production: env.isProduction, salesPhone: env.salesPhone ?? null });
}
