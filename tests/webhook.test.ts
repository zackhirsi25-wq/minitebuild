import { describe, expect, it } from "vitest";
import {
  businessStatusFor,
  handleBillingEvent,
  subscriptionStatusFor,
  type BillingStore,
  type SubscriptionStatus,
} from "@/lib/billing/handle-event";
import { parseStubEvent } from "@/lib/billing/stub";
import type { BillingEvent } from "@/lib/billing/types";
import type { BusinessStatus } from "@/lib/content/schema";

/** In-memory BillingStore mirroring the Supabase one, including the unique event key. */
function memoryStore(businessIds: string[]) {
  const events = new Map<string, { processed: boolean; error?: string }>();
  const businesses = new Map(
    businessIds.map((id) => [id, { status: "preview" as BusinessStatus, paid: false, applyCount: 0 }]),
  );
  const subscriptions = new Map<string, SubscriptionStatus>();
  let failNextApply = false;

  const store: BillingStore = {
    async recordEvent(e) {
      const key = `${e.provider}:${e.eventId}`;
      const existing = events.get(key);
      if (existing?.processed) return "processed";
      if (!existing) events.set(key, { processed: false });
      return "new";
    },
    async businessExists(id) {
      return businesses.has(id);
    },
    async upsertSubscription(e, status) {
      subscriptions.set(`${e.provider}:${e.subscriptionId}`, status);
    },
    async applyBusinessStatus(id, status, { paid }) {
      if (failNextApply) {
        failNextApply = false;
        throw new Error("database unavailable");
      }
      const b = businesses.get(id)!;
      b.status = status;
      b.paid ||= paid;
      b.applyCount++;
    },
    async markProcessed(e, note) {
      events.set(`${e.provider}:${e.eventId}`, { processed: true, error: note });
    },
    async markFailed(e, error) {
      events.set(`${e.provider}:${e.eventId}`, { processed: false, error });
    },
  };
  return {
    store,
    businesses,
    subscriptions,
    events,
    failNext() {
      failNextApply = true;
    },
  };
}

const event = (overrides: Partial<BillingEvent> = {}): BillingEvent => ({
  provider: "stub",
  eventId: "evt_1",
  type: "payment_succeeded",
  businessId: "biz_1",
  plan: "monthly",
  subscriptionId: "sub_1",
  raw: {},
  ...overrides,
});

describe("status mapping", () => {
  it("goes live on payment and pauses on cancellation or failed payment", () => {
    expect(businessStatusFor("payment_succeeded")).toBe("live");
    expect(businessStatusFor("payment_failed")).toBe("paused");
    expect(businessStatusFor("subscription_canceled")).toBe("paused");
    expect(subscriptionStatusFor("payment_succeeded")).toBe("active");
    expect(subscriptionStatusFor("payment_failed")).toBe("past_due");
    expect(subscriptionStatusFor("subscription_canceled")).toBe("canceled");
  });
});

describe("handleBillingEvent", () => {
  it("sets the business live and records payment", async () => {
    const m = memoryStore(["biz_1"]);
    expect(await handleBillingEvent(event(), m.store)).toEqual({ outcome: "applied", status: "live" });
    expect(m.businesses.get("biz_1")).toMatchObject({ status: "live", paid: true });
    expect(m.subscriptions.get("stub:sub_1")).toBe("active");
  });

  it("pauses on a failed payment and on cancellation", async () => {
    const m = memoryStore(["biz_1"]);
    await handleBillingEvent(event(), m.store);
    await handleBillingEvent(event({ eventId: "evt_2", type: "payment_failed" }), m.store);
    expect(m.businesses.get("biz_1")!.status).toBe("paused");
    expect(m.subscriptions.get("stub:sub_1")).toBe("past_due");

    await handleBillingEvent(event({ eventId: "evt_3", type: "payment_succeeded" }), m.store);
    expect(m.businesses.get("biz_1")!.status).toBe("live");

    await handleBillingEvent(event({ eventId: "evt_4", type: "subscription_canceled" }), m.store);
    expect(m.businesses.get("biz_1")!.status).toBe("paused");
    expect(m.subscriptions.get("stub:sub_1")).toBe("canceled");
  });

  it("processes each event only once", async () => {
    const m = memoryStore(["biz_1"]);
    await handleBillingEvent(event(), m.store);
    // A cancellation arrives, then the old payment event is redelivered.
    await handleBillingEvent(event({ eventId: "evt_2", type: "subscription_canceled" }), m.store);
    expect(await handleBillingEvent(event(), m.store)).toEqual({ outcome: "duplicate" });
    expect(m.businesses.get("biz_1")).toMatchObject({ status: "paused", applyCount: 2 });
  });

  it("treats the same event id from another provider as a different event", async () => {
    const m = memoryStore(["biz_1"]);
    await handleBillingEvent(event(), m.store);
    expect((await handleBillingEvent(event({ provider: "manual" }), m.store)).outcome).toBe("applied");
  });

  it("retries an event whose first attempt failed", async () => {
    const m = memoryStore(["biz_1"]);
    m.failNext();
    await expect(handleBillingEvent(event(), m.store)).rejects.toThrow("database unavailable");
    expect(m.events.get("stub:evt_1")).toEqual({ processed: false, error: "database unavailable" });
    expect(await handleBillingEvent(event(), m.store)).toEqual({ outcome: "applied", status: "live" });
  });

  it("ignores events for unknown businesses without failing", async () => {
    const m = memoryStore([]);
    expect(await handleBillingEvent(event(), m.store)).toEqual({ outcome: "unknown_business" });
    expect(await handleBillingEvent(event(), m.store)).toEqual({ outcome: "duplicate" });
  });
});

describe("stub webhook payload", () => {
  it("parses a valid payload", () => {
    const parsed = parseStubEvent({
      eventId: "evt_9",
      type: "payment_failed",
      businessId: "3f1c1f1e-7d5c-4b1a-9a3e-2f6f3b8a1c2d",
      plan: "annual",
      subscriptionId: "stub_sub_1",
    });
    expect(parsed).toMatchObject({ provider: "stub", type: "payment_failed", plan: "annual" });
  });

  it("rejects unknown event types", () => {
    expect(() =>
      parseStubEvent({
        eventId: "evt_9",
        type: "refund",
        businessId: "3f1c1f1e-7d5c-4b1a-9a3e-2f6f3b8a1c2d",
        plan: "monthly",
        subscriptionId: "x",
      }),
    ).toThrow();
  });
});
