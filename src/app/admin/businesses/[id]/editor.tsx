"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import type { BusinessEdit } from "@/lib/admin/details";
import { LIMITS, type SiteContent, type TemplateId, type Trade } from "@/lib/content/schema";
import { confirmServices, saveBusiness } from "../../actions";

type Details = {
  name: string;
  city: string;
  phone: string;
  address: string;
  category: string;
  hours: string[];
  websiteUrl: string;
  trade: Trade;
  template: TemplateId;
};
type State = { details: Details; content: SiteContent };

const inputClass =
  "mt-1 block w-full rounded-lg border px-3 py-2.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-100";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (props: { className: string; "aria-invalid": boolean }) => ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 text-sm font-medium text-slate-700">
        {label}
        {hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      </span>
      {children({
        className: `${inputClass} ${error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-brand-600"}`,
        "aria-invalid": !!error,
      })}
      {error && <span className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

function Count({ value, limit }: { value: string; limit: readonly [number, number] }) {
  const n = value.trim().length;
  const bad = n < limit[0] || n > limit[1];
  return (
    <span className={bad ? "font-semibold text-red-700" : undefined}>
      {n}/{limit[1]}
    </span>
  );
}

function Section({ title, children, action }: { title: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <legend className="font-semibold">{title}</legend>
        {action}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  );
}

export function Editor({
  id,
  slug,
  initial,
  savedAt,
  servicesConfirmed,
  templates,
}: {
  id: string;
  slug: string;
  initial: State;
  savedAt: string;
  /** False until the admin edits the services or confirms them as they are. */
  servicesConfirmed: boolean;
  /** Every registered template, in gallery order. */
  templates: { id: string; name: string }[];
}) {
  const toast = useToast();
  const initialJson = JSON.stringify(initial);
  const [state, setState] = useState<State>(initial);
  const [baseline, setBaseline] = useState(initialJson);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(savedAt);
  const dirty = useMemo(() => JSON.stringify(state) !== baseline, [state, baseline]);
  const servicesDirty = useMemo(
    () => JSON.stringify(state.content.services) !== JSON.stringify((JSON.parse(baseline) as State).content.services),
    [state, baseline],
  );
  const [confirming, setConfirming] = useState(false);

  async function confirm() {
    setConfirming(true);
    const result = await confirmServices(id).catch(() => ({ ok: false as const, error: "Couldn't reach the server." }));
    setConfirming(false);
    if (result.ok) toast.show("Services confirmed");
    else toast.show(result.error, "error");
  }

  // The server data changed underneath us (regenerate, refresh from Google, save): load it.
  const lastInitial = useRef(initialJson);
  useEffect(() => {
    if (initialJson !== lastInitial.current) {
      lastInitial.current = initialJson;
      setState(JSON.parse(initialJson));
      setBaseline(initialJson);
      setPreviewVersion(savedAt);
    }
  }, [initialJson, savedAt]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setDetail = <K extends keyof Details>(key: K, value: Details[K]) =>
    setState((s) => ({ ...s, details: { ...s.details, [key]: value } }));
  const setContent = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setState((s) => ({ ...s, content: { ...s.content, [key]: value } }));
  const err = (path: string) => fieldErrors[path];

  async function save() {
    setSaving(true);
    setError(null);
    const payload: BusinessEdit = { details: state.details, content: state.content };
    const result = await saveBusiness(id, payload).catch(() => ({
      ok: false as const,
      error: "Couldn't reach the server. Your changes are still here; try again.",
      fieldErrors: {},
    }));
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      setFieldErrors(result.fieldErrors);
      return;
    }
    setFieldErrors({});
    setBaseline(JSON.stringify(state));
    setLastSaved(result.savedAt);
    setPreviewVersion(result.savedAt);
    toast.show("Saved");
  }

  const { details, content } = state;
  const previewSrc = `/admin-preview/${id}?template=${details.template}&v=${encodeURIComponent(previewVersion)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty && !saving) save();
        }}
      >
        <Section title="Template">
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map(({ id: t, name }) => (
              <label
                key={t}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
              >
                <input
                  type="radio"
                  name="template"
                  value={t}
                  checked={details.template === t}
                  onChange={() => setDetail("template", t)}
                />
                {name}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Business details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" error={err("details.name")}>
              {(p) => <input {...p} value={details.name} onChange={(e) => setDetail("name", e.target.value)} />}
            </Field>
            <Field label="Phone" error={err("details.phone")}>
              {(p) => (
                <input {...p} type="tel" value={details.phone} onChange={(e) => setDetail("phone", e.target.value)} />
              )}
            </Field>
            <Field label="City" error={err("details.city")}>
              {(p) => <input {...p} value={details.city} onChange={(e) => setDetail("city", e.target.value)} />}
            </Field>
            <Field label="Category" error={err("details.category")}>
              {(p) => <input {...p} value={details.category} onChange={(e) => setDetail("category", e.target.value)} />}
            </Field>
          </div>
          <Field label="Address" error={err("details.address")} hint="Leave empty to hide it">
            {(p) => <input {...p} value={details.address} onChange={(e) => setDetail("address", e.target.value)} />}
          </Field>
          <Field label="Hours" error={err("details.hours")} hint="One line per day, e.g. Monday: 8:00 AM – 5:00 PM">
            {(p) => (
              <textarea
                {...p}
                rows={7}
                value={details.hours.join("\n")}
                onChange={(e) => setDetail("hours", e.target.value.split("\n"))}
              />
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Existing website" error={err("details.websiteUrl")}>
              {(p) => (
                <input
                  {...p}
                  type="url"
                  value={details.websiteUrl}
                  onChange={(e) => setDetail("websiteUrl", e.target.value)}
                />
              )}
            </Field>
            <Field label="Trade (sets the stock photos)">
              {(p) => (
                <select {...p} value={details.trade} onChange={(e) => setDetail("trade", e.target.value as Trade)}>
                  <option value="general_contractor">General contractor</option>
                  <option value="remodeling">Remodeling</option>
                </select>
              )}
            </Field>
          </div>
        </Section>

        <Section title="Hero">
          <Field
            label="Headline"
            error={err("content.headline")}
            hint={<Count value={content.headline} limit={LIMITS.headline} />}
          >
            {(p) => <input {...p} value={content.headline} onChange={(e) => setContent("headline", e.target.value)} />}
          </Field>
          <Field
            label="Subheadline"
            error={err("content.subheadline")}
            hint={<Count value={content.subheadline} limit={LIMITS.subheadline} />}
          >
            {(p) => (
              <textarea
                {...p}
                rows={3}
                value={content.subheadline}
                onChange={(e) => setContent("subheadline", e.target.value)}
              />
            )}
          </Field>
        </Section>

        <Section
          title={
            <span className="flex items-center gap-2">
              Services ({content.services.length})
              {!servicesConfirmed && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                  Unconfirmed
                </span>
              )}
            </span>
          }
          action={
            content.services.length < LIMITS.services[1] && (
              <button
                type="button"
                onClick={() => setContent("services", [...content.services, { title: "", description: "" }])}
                className="min-h-11 rounded-lg px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                + Add service
              </button>
            )
          }
        >
          {!servicesConfirmed && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="max-w-prose">
                {servicesDirty
                  ? "Saving your edits will confirm these services."
                  : "These services were written by Claude. Check them with the owner, then edit and save, or confirm them as they are."}
              </p>
              {!servicesDirty && (
                <button
                  type="button"
                  onClick={confirm}
                  disabled={confirming}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                >
                  {confirming && <Spinner />}
                  Confirm services
                </button>
              )}
            </div>
          )}
          {err("content.services") && <p className="text-sm text-red-700">{err("content.services")}</p>}
          {content.services.map((service, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Service {i + 1}</span>
                {content.services.length > LIMITS.services[0] && (
                  <button
                    type="button"
                    onClick={() =>
                      setContent(
                        "services",
                        content.services.filter((_, j) => j !== i),
                      )
                    }
                    className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <Field
                  label="Title"
                  error={err(`content.services.${i}.title`)}
                  hint={<Count value={service.title} limit={LIMITS.serviceTitle} />}
                >
                  {(p) => (
                    <input
                      {...p}
                      value={service.title}
                      onChange={(e) =>
                        setContent(
                          "services",
                          content.services.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)),
                        )
                      }
                    />
                  )}
                </Field>
                <Field
                  label="Description"
                  error={err(`content.services.${i}.description`)}
                  hint={<Count value={service.description} limit={LIMITS.serviceDescription} />}
                >
                  {(p) => (
                    <textarea
                      {...p}
                      rows={2}
                      value={service.description}
                      onChange={(e) =>
                        setContent(
                          "services",
                          content.services.map((s, j) => (j === i ? { ...s, description: e.target.value } : s)),
                        )
                      }
                    />
                  )}
                </Field>
              </div>
            </div>
          ))}
        </Section>

        <Section title="About">
          <Field
            label="About text"
            error={err("content.about")}
            hint={<Count value={content.about} limit={LIMITS.about} />}
          >
            {(p) => (
              <textarea {...p} rows={8} value={content.about} onChange={(e) => setContent("about", e.target.value)} />
            )}
          </Field>
        </Section>

        <Section title="Service areas">
          <Field
            label="One place per line"
            error={
              err("content.serviceAreas") ??
              Object.entries(fieldErrors).find(([k]) => k.startsWith("content.serviceAreas."))?.[1]
            }
            hint={`${content.serviceAreas.filter((a) => a.trim()).length} of ${LIMITS.serviceAreas[0]}–${LIMITS.serviceAreas[1]}`}
          >
            {(p) => (
              <textarea
                {...p}
                rows={6}
                value={content.serviceAreas.join("\n")}
                onChange={(e) => setContent("serviceAreas", e.target.value.split("\n"))}
                onBlur={() => setContent("serviceAreas", content.serviceAreas.map((a) => a.trim()).filter(Boolean))}
              />
            )}
          </Field>
        </Section>

        <Section
          title={`FAQ (${content.faq.length})`}
          action={
            content.faq.length < LIMITS.faq[1] && (
              <button
                type="button"
                onClick={() => setContent("faq", [...content.faq, { question: "", answer: "" }])}
                className="min-h-11 rounded-lg px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                + Add question
              </button>
            )
          }
        >
          {err("content.faq") && <p className="text-sm text-red-700">{err("content.faq")}</p>}
          {content.faq.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Question {i + 1}</span>
                {content.faq.length > LIMITS.faq[0] && (
                  <button
                    type="button"
                    onClick={() =>
                      setContent(
                        "faq",
                        content.faq.filter((_, j) => j !== i),
                      )
                    }
                    className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <Field
                  label="Question"
                  error={err(`content.faq.${i}.question`)}
                  hint={<Count value={item.question} limit={LIMITS.faqQuestion} />}
                >
                  {(p) => (
                    <input
                      {...p}
                      value={item.question}
                      onChange={(e) =>
                        setContent(
                          "faq",
                          content.faq.map((f, j) => (j === i ? { ...f, question: e.target.value } : f)),
                        )
                      }
                    />
                  )}
                </Field>
                <Field
                  label="Answer"
                  error={err(`content.faq.${i}.answer`)}
                  hint={<Count value={item.answer} limit={LIMITS.faqAnswer} />}
                >
                  {(p) => (
                    <textarea
                      {...p}
                      rows={3}
                      value={item.answer}
                      onChange={(e) =>
                        setContent(
                          "faq",
                          content.faq.map((f, j) => (j === i ? { ...f, answer: e.target.value } : f)),
                        )
                      }
                    />
                  )}
                </Field>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Call to action">
          <Field
            label="Heading"
            error={err("content.cta.heading")}
            hint={<Count value={content.cta.heading} limit={LIMITS.ctaHeading} />}
          >
            {(p) => (
              <input
                {...p}
                value={content.cta.heading}
                onChange={(e) => setContent("cta", { ...content.cta, heading: e.target.value })}
              />
            )}
          </Field>
          <Field
            label="Text"
            error={err("content.cta.body")}
            hint={<Count value={content.cta.body} limit={LIMITS.ctaBody} />}
          >
            {(p) => (
              <textarea
                {...p}
                rows={2}
                value={content.cta.body}
                onChange={(e) => setContent("cta", { ...content.cta, body: e.target.value })}
              />
            )}
          </Field>
          <Field
            label="Button label"
            error={err("content.cta.buttonLabel")}
            hint={<Count value={content.cta.buttonLabel} limit={LIMITS.ctaButton} />}
          >
            {(p) => (
              <input
                {...p}
                value={content.cta.buttonLabel}
                onChange={(e) => setContent("cta", { ...content.cta, buttonLabel: e.target.value })}
              />
            )}
          </Field>
        </Section>

        {/* Save bar: sticks to the bottom of the screen (above the phone tab bar). */}
        <div className="sticky bottom-20 z-30 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm" aria-live="polite">
              {saving ? (
                <span className="text-slate-600">Saving…</span>
              ) : error ? (
                <span className="font-medium text-red-700">{error}</span>
              ) : dirty ? (
                <span className="font-medium text-amber-700">Unsaved changes</span>
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {lastSaved ? "Saved" : "All changes saved"}
                </span>
              )}
            </p>
            <button
              type="submit"
              disabled={!dirty || saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving && <Spinner />}
              {saving ? "Saving" : dirty ? "Save" : "Saved"}
            </button>
          </div>
        </div>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2">
            <p className="text-sm font-semibold text-slate-700">Live preview</p>
            <p className="text-xs text-slate-500">{dirty ? "Shows the last saved version" : "Up to date"}</p>
          </div>
          <iframe
            key={previewSrc}
            src={previewSrc}
            title={`Preview of ${details.name || slug}`}
            className="block h-[70vh] w-full lg:h-[calc(100vh-7rem)]"
          />
        </div>
      </div>
    </div>
  );
}
