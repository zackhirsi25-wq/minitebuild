import type { PlanId } from "@/config/product";

export type BillingEventType = "payment_succeeded" | "payment_failed" | "subscription_canceled";

/** A provider's webhook payload, normalized. */
export type BillingEvent = {
  provider: string;
  /** The provider's unique id for this delivery; used to process it only once. */
  eventId: string;
  type: BillingEventType;
  businessId: string;
  plan: PlanId;
  subscriptionId: string;
  customerId?: string | null;
  currentPeriodEnd?: string | null;
  raw: unknown;
};

export type CheckoutRequest = {
  businessId: string;
  slug: string;
  businessName: string;
  plan: PlanId;
  /** Absolute origin of the app, e.g. https://minitebuild.com */
  origin: string;
};

export type CheckoutResult =
  | { kind: "redirect"; url: string }
  /** Online payment isn't available: show "Contact us to activate". */
  | { kind: "contact"; phone: string | null };

export interface BillingProvider {
  readonly id: string;
  /** False when customers can't pay online yet (stub in production): checkout shows a phone number. */
  readonly online: boolean;
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
  /** Verifies and parses a webhook request. Throws WebhookRejectedError if it isn't genuine. */
  parseWebhook(request: Request): Promise<BillingEvent>;
}

export class WebhookRejectedError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "WebhookRejectedError";
  }
}
