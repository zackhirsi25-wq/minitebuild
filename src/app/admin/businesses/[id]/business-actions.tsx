"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { annualSaving, formatPrice, product, type PlanId } from "@/config/product";
import type { BusinessStatus } from "@/lib/content/schema";
import {
  markAsPaid,
  pauseBusiness,
  publishBusiness,
  refreshFromGoogle,
  regenerateBusinessCopy,
  type ActionResult,
} from "../../actions";
import { Spinner } from "@/components/ui/spinner";

const secondary = "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50";

export function BusinessActions({ id, status }: { id: string; status: BusinessStatus }) {
  const router = useRouter();
  const toast = useToast();
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [refreshing, setRefreshing] = useState(false);

  async function run(action: () => Promise<ActionResult>): Promise<string | null> {
    const result = await action();
    if (!result.ok) return result.error;
    if (result.message) toast.show(result.message);
    router.refresh();
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "live" && (
        <ConfirmButton
          label="Publish"
          title="Publish this site?"
          description="It goes live at its own address right away, and the preview link starts redirecting there."
          confirmLabel="Publish"
          buttonClassName="bg-emerald-600 text-white hover:bg-emerald-700"
          onConfirm={() => run(() => publishBusiness(id))}
        />
      )}
      {status === "live" && (
        <ConfirmButton
          label="Pause"
          title="Pause this site?"
          description="Visitors will see a “temporarily unavailable” page until you publish it again."
          confirmLabel="Pause site"
          tone="danger"
          buttonClassName={secondary}
          onConfirm={() => run(() => pauseBusiness(id))}
        />
      )}
      <ConfirmButton
        label="Mark as paid"
        title="Mark as paid?"
        description="Use this when the customer paid outside the app. The site goes live and the business is recorded as owner-confirmed."
        confirmLabel="Mark as paid"
        buttonClassName={secondary}
        onConfirm={() => run(() => markAsPaid(id, plan))}
      >
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Plan</legend>
          <div className="mt-2 grid gap-2">
            {(["monthly", "annual"] as PlanId[]).map((p) => (
              <label
                key={p}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 has-[:checked]:border-brand-600"
              >
                <input type="radio" name="plan" value={p} checked={plan === p} onChange={() => setPlan(p)} />
                <span>
                  {product.plans[p].label}: {formatPrice(product.plans[p].price)}/{product.plans[p].short}
                  {p === "annual" && (
                    <span className="text-sm text-emerald-700"> (saves {formatPrice(annualSaving)})</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </ConfirmButton>
      <ConfirmButton
        label="Regenerate copy"
        title="Write new copy?"
        description="Claude rewrites every text field from the business details. Your edits to the copy will be replaced."
        confirmLabel="Regenerate"
        buttonClassName={secondary}
        onConfirm={() => run(() => regenerateBusinessCopy(id))}
      />
      <button
        type="button"
        disabled={refreshing}
        onClick={async () => {
          setRefreshing(true);
          const error = await run(() => refreshFromGoogle(id));
          setRefreshing(false);
          if (error) toast.show(error, "error");
        }}
        className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:opacity-60 ${secondary}`}
      >
        {refreshing && <Spinner />}
        Refresh from Google
      </button>
    </div>
  );
}
