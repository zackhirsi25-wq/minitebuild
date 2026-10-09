import { annualSaving, formatPrice, product } from "@/config/product";
import { getBillingProvider } from "@/lib/billing";
import { env, fixtureModes } from "@/lib/env";
import { appUrl } from "@/lib/routing/hostname";
import { signOut } from "../../login/actions";

export const metadata = { title: "Settings" };

function Row({ label, value, ok, note }: { label: string; value: string; ok?: boolean; note?: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
      <dt className="font-medium text-slate-700">{label}</dt>
      <dd className="sm:text-right">
        <span className="flex items-center gap-2 sm:justify-end">
          {ok !== undefined && (
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
          )}
          <span className="break-all text-slate-900">{value}</span>
        </span>
        {note && <span className="mt-0.5 block text-sm text-slate-500">{note}</span>}
      </dd>
    </div>
  );
}

export default function SettingsPage() {
  const fixtures = fixtureModes();
  const billing = getBillingProvider();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-slate-600">
          Read-only overview. Prices live in <code className="rounded bg-slate-100 px-1">src/config/product.ts</code>; keys are
          environment variables.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white px-5">
        <h2 className="pt-4 font-semibold">Product</h2>
        <dl className="divide-y divide-slate-100">
          <Row label="Name" value={product.name} />
          <Row label="Monthly" value={`${formatPrice(product.plans.monthly.price)}/mo`} />
          <Row label="Annual" value={`${formatPrice(product.plans.annual.price)}/yr`} note={`Saves ${formatPrice(annualSaving)} a year`} />
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-5">
        <h2 className="pt-4 font-semibold">Connections</h2>
        <dl className="divide-y divide-slate-100">
          <Row
            label="Claude (site copy)"
            value={fixtures.copy ? "Sample copy (no API key)" : env.anthropicModel}
            ok={!fixtures.copy}
            note={fixtures.copy ? "Set ANTHROPIC_API_KEY to write real copy." : undefined}
          />
          <Row
            label="Google Places"
            value={fixtures.places ? "Fixture data (no API key)" : "Connected"}
            ok={!fixtures.places}
            note={fixtures.places ? "Set GOOGLE_PLACES_API_KEY to look businesses up." : undefined}
          />
          <Row
            label="Billing"
            value={billing.online ? `${billing.id} (test checkout)` : `${billing.id} (contact to activate)`}
            ok={false}
            note={billing.online ? "Checkout opens a fake payment page." : `Checkout shows ${env.salesPhone ?? "no number: set SALES_PHONE"}. Use “Mark as paid”.`}
          />
          <Row
            label="Background worker"
            value={env.workerSecret ? appUrl("/api/worker", env.rootDomain) : "WORKER_SECRET not set"}
            ok={!!env.workerSecret}
            note="Called every minute by Supabase pg_cron. See the README for the two Vault secrets it needs."
          />
          <Row label="Sites served at" value={`*.${env.rootDomain}`} />
          <Row label="Admin" value={env.adminEmail} />
        </dl>
      </section>

      <form action={signOut}>
        <button type="submit" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50">
          Sign out
        </button>
      </form>
    </div>
  );
}
