import type { BusinessStatus } from "@/lib/content/schema";
import type { BillingEvent, BillingEventType } from "./types";

export type SubscriptionStatus = "active" | "past_due" | "canceled";

/** Payment makes a site live; cancellation or a failed payment pauses it. */
export function businessStatusFor(type: BillingEventType): BusinessStatus {
  return type === "payment_succeeded" ? "live" : "paused";
}

export function subscriptionStatusFor(type: BillingEventType): SubscriptionStatus {
  switch (type) {
    case "payment_succeeded":
      return "active";
    case "payment_failed":
      return "past_due";
    case "subscription_canceled":
      return "canceled";
  }
}

/** Persistence the handler needs. The Supabase implementation lives in store.ts. */
export interface BillingStore {
  /**
   * Records the event if it is new. Returns "processed" if this event id was
   * already applied, "new" otherwise (including a previous failed attempt).
   */
  recordEvent(event: BillingEvent): Promise<"new" | "processed">;
  businessExists(businessId: string): Promise<boolean>;
  upsertSubscription(event: BillingEvent, status: SubscriptionStatus): Promise<void>;
  applyBusinessStatus(businessId: string, status: BusinessStatus, opts: { paid: boolean }): Promise<void>;
  /** Sets processed_at (with an optional note), so redeliveries are skipped. */
  markProcessed(event: BillingEvent, note?: string): Promise<void>;
  /** Records an error without processed_at, so a redelivery tries again. */
  markFailed(event: BillingEvent, error: string): Promise<void>;
}

export type HandleResult =
  { outcome: "applied"; status: BusinessStatus } | { outcome: "duplicate" } | { outcome: "unknown_business" };

/** Applies a billing event exactly once. */
export async function handleBillingEvent(event: BillingEvent, store: BillingStore): Promise<HandleResult> {
  const recorded = await store.recordEvent(event);
  if (recorded === "processed") return { outcome: "duplicate" };

  if (!(await store.businessExists(event.businessId))) {
    await store.markProcessed(event, "Business not found");
    return { outcome: "unknown_business" };
  }

  try {
    const status = businessStatusFor(event.type);
    await store.upsertSubscription(event, subscriptionStatusFor(event.type));
    await store.applyBusinessStatus(event.businessId, status, { paid: event.type === "payment_succeeded" });
    await store.markProcessed(event);
    return { outcome: "applied", status };
  } catch (error) {
    await store.markFailed(event, error instanceof Error ? error.message : String(error)).catch(() => undefined);
    throw error;
  }
}
