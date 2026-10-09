import { z } from "zod";
import { PLAN_IDS, type PlanId } from "@/config/product";
import { WebhookRejectedError, type BillingEvent, type BillingProvider } from "./types";

// Stand-in until Paddle or Lemon Squeezy is wired up.
//   * Development: checkout opens /billing/stub, a fake payment page whose
//     buttons POST a stub event to /api/billing/webhook.
//   * Production: checkout shows "Contact us to activate" with SALES_PHONE,
//     and the stub webhook refuses every request. The admin uses "Mark as paid".

const stubEventSchema = z.object({
  eventId: z.string().min(1).max(200),
  type: z.enum(["payment_succeeded", "payment_failed", "subscription_canceled"]),
  businessId: z.uuid(),
  plan: z.enum(PLAN_IDS as [PlanId, ...PlanId[]]),
  subscriptionId: z.string().min(1).max(200),
});

export type StubEventPayload = z.infer<typeof stubEventSchema>;

export function parseStubEvent(payload: unknown): BillingEvent {
  const data = stubEventSchema.parse(payload);
  return { provider: "stub", ...data, raw: data };
}

export function createStubProvider(opts: { production: boolean; salesPhone: string | null }): BillingProvider {
  return {
    id: "stub",
    online: !opts.production,

    async createCheckout({ businessId, plan }) {
      if (opts.production) return { kind: "contact", phone: opts.salesPhone };
      const params = new URLSearchParams({ business: businessId, plan });
      return { kind: "redirect", url: `/billing/stub?${params}` };
    },

    async parseWebhook(request) {
      if (opts.production) {
        throw new WebhookRejectedError("The stub billing webhook is disabled in production.", 404);
      }
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new WebhookRejectedError("Body is not JSON.");
      }
      try {
        return parseStubEvent(body);
      } catch {
        throw new WebhookRejectedError("Body is not a valid stub billing event.");
      }
    },
  };
}
