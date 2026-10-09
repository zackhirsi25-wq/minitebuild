import type { ReactNode } from "react";
import { telHref } from "@/lib/content/phone";

// Building blocks shared by the three templates. All server components: the
// FAQ uses <details>/<summary> and the call bar is plain CSS, so generated
// sites ship no JavaScript of their own.

export function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

export function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function MapPinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

/** A link that dials the business. */
export function CallLink({
  phone,
  className,
  children,
  label,
}: {
  phone: string;
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <a href={telHref(phone)} className={className} aria-label={label}>
      {children}
    </a>
  );
}

/**
 * Sticky call bar on phones (hidden from md up, where the header has a call
 * button). Pair it with `pb-20 md:pb-0` on the page so it never covers the footer.
 */
export function MobileCallBar({ phone, className }: { phone: string; className: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <a
        href={telHref(phone)}
        className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold shadow-lg ${className}`}
      >
        <PhoneIcon />
        <span>Call {phone}</span>
      </a>
    </div>
  );
}

/** Accordion built on <details>, so it works without JavaScript. */
export function FaqList({
  items,
  itemClassName,
  questionClassName,
  answerClassName,
  iconClassName,
}: {
  items: { question: string; answer: string }[];
  itemClassName: string;
  questionClassName: string;
  answerClassName: string;
  iconClassName: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details key={item.question} className={`group ${itemClassName}`}>
          <summary
            className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden ${questionClassName}`}
          >
            <h3 className="text-base font-semibold leading-snug sm:text-lg">{item.question}</h3>
            <span
              aria-hidden="true"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xl leading-none transition-transform group-open:rotate-45 ${iconClassName}`}
            >
              +
            </span>
          </summary>
          <p className={`px-5 pb-5 leading-relaxed ${answerClassName}`}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Opening hours from Google ("Monday: 8:00 AM – 5:00 PM"), as a two-column list. */
export function HoursList({ hours, className = "" }: { hours: string[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 ${className}`}>
      {hours.map((line) => {
        const [day, ...rest] = line.split(": ");
        return (
          <div key={line} className="contents">
            <dt className="font-medium">{day}</dt>
            <dd>{rest.join(": ") || "—"}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Splits the about text into paragraphs on blank lines. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => (
          <p key={p.slice(0, 40)} className={className}>
            {p}
          </p>
        ))}
    </>
  );
}

/** JSON-LD as a text child (React does not escape script contents); "<" is escaped so content can't close the tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json">{JSON.stringify(data).replace(/</g, "\\u003c")}</script>;
}
