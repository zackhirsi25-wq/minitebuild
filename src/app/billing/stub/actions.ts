"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import type { StubEventPayload } from "@/lib/billing/stub";
import { env } from "@/lib/env";
import { requestOrigin } from "@/lib/request-origin";

/** Fake payment page buttons: send a stub event to our own webhook, like a real provider would. */
export async function fireStubEvent(formData: FormData) {
  if (env.isProduction) redirect("/");

  const payload: StubEventPayload = {
    eventId: `stub_evt_${randomUUID()}`,
    type: String(formData.get("type")) as StubEventPayload["type"],
    businessId: String(formData.get("businessId")),
    plan: String(formData.get("plan")) as StubEventPayload["plan"],
    subscriptionId: `stub_sub_${String(formData.get("businessId"))}`,
  };

  const response = await fetch(`${await requestOrigin()}/api/billing/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const ok = response.ok;
  const params = new URLSearchParams({ business: payload.businessId, event: payload.type, ok: ok ? "1" : "0" });
  redirect(`/billing/done?${params}`);
}
