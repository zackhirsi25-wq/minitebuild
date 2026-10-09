import { getBillingProvider } from "@/lib/billing";
import { handleBillingEvent } from "@/lib/billing/handle-event";
import { slugForBusiness, supabaseBillingStore } from "@/lib/billing/store";
import { WebhookRejectedError } from "@/lib/billing/types";
import { revalidateSite } from "@/lib/sites/revalidate";

// Billing provider webhook. Payment -> live; cancellation or failed payment
// -> paused. Each event id is applied once (see billing_events).

export async function POST(request: Request) {
  const provider = getBillingProvider();

  let event;
  try {
    event = await provider.parseWebhook(request);
  } catch (error) {
    if (error instanceof WebhookRejectedError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  try {
    const result = await handleBillingEvent(event, supabaseBillingStore());
    if (result.outcome === "applied") {
      const slug = await slugForBusiness(event.businessId);
      if (slug) revalidateSite(slug);
    }
    return Response.json(result);
  } catch (error) {
    console.error("Billing webhook failed", error);
    // 500 tells the provider to deliver the event again later.
    return Response.json({ error: "Could not process the event" }, { status: 500 });
  }
}
