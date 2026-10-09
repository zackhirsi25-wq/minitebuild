import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { BillingStore } from "./handle-event";

/** BillingStore backed by Supabase (secret key; only call after verifying the event). */
export function supabaseBillingStore(): BillingStore {
  const db = supabaseAdmin();

  return {
    async recordEvent(event) {
      const { data: inserted, error } = await db
        .from("billing_events")
        .upsert(
          {
            provider: event.provider,
            event_id: event.eventId,
            type: event.type,
            business_id: null,
            payload: (event.raw ?? {}) as NonNullable<Json>,
          },
          { onConflict: "provider,event_id", ignoreDuplicates: true },
        )
        .select("id");
      if (error) throw new Error(`Could not record billing event: ${error.message}`);
      if (inserted && inserted.length > 0) return "new";

      const { data: existing, error: readError } = await db
        .from("billing_events")
        .select("processed_at")
        .eq("provider", event.provider)
        .eq("event_id", event.eventId)
        .single();
      if (readError) throw new Error(`Could not read billing event: ${readError.message}`);
      return existing.processed_at ? "processed" : "new";
    },

    async businessExists(businessId) {
      const { data } = await db.from("businesses").select("id").eq("id", businessId).maybeSingle();
      return !!data;
    },

    async upsertSubscription(event, status) {
      const { error } = await db.from("subscriptions").upsert(
        {
          business_id: event.businessId,
          provider: event.provider,
          provider_subscription_id: event.subscriptionId,
          provider_customer_id: event.customerId ?? null,
          plan: event.plan,
          status,
          current_period_end: event.currentPeriodEnd ?? null,
          canceled_at: status === "canceled" ? new Date().toISOString() : null,
        },
        { onConflict: "provider,provider_subscription_id" },
      );
      if (error) throw new Error(`Could not save subscription: ${error.message}`);
    },

    async applyBusinessStatus(businessId, status, { paid }) {
      const { data: current, error: readError } = await db
        .from("businesses")
        .select("tags, owner_confirmed_at, published_at")
        .eq("id", businessId)
        .single();
      if (readError) throw new Error(`Could not read business: ${readError.message}`);

      const now = new Date().toISOString();
      const update: Database["public"]["Tables"]["businesses"]["Update"] = { status };
      if (status === "live") {
        update.published_at = current.published_at ?? now;
        update.paused_at = null;
      } else {
        update.paused_at = now;
      }
      if (paid) {
        // Paying is the owner confirming the business and its details.
        update.owner_confirmed_at = current.owner_confirmed_at ?? now;
        update.tags = Array.from(new Set([...current.tags, "paid"]));
      }
      const { error } = await db.from("businesses").update(update).eq("id", businessId);
      if (error) throw new Error(`Could not update business: ${error.message}`);
    },

    async markProcessed(event, note) {
      await db
        .from("billing_events")
        .update({
          processed_at: new Date().toISOString(),
          error: note ?? null,
          business_id: await knownBusinessId(event.businessId),
        })
        .eq("provider", event.provider)
        .eq("event_id", event.eventId);
    },

    async markFailed(event, error) {
      await db.from("billing_events").update({ error }).eq("provider", event.provider).eq("event_id", event.eventId);
    },
  };

  async function knownBusinessId(id: string): Promise<string | null> {
    const { data } = await db.from("businesses").select("id").eq("id", id).maybeSingle();
    return data?.id ?? null;
  }
}

/** Slug for a business id, used to refresh its cached site after a status change. */
export async function slugForBusiness(businessId: string): Promise<string | null> {
  const { data } = await supabaseAdmin().from("businesses").select("slug").eq("id", businessId).maybeSingle();
  return data?.slug ?? null;
}
