import type { ReactNode } from "react";
import { telHref } from "@/lib/content/phone";

// Small building blocks every template uses. Templates pass their own class
// names; these only fix the structure and accessibility.

export function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

/** Start of every template: header sentinel and skip link. */
export function SiteStart({ skipClass }: { skipClass: string }) {
  return (
    <>
      <span data-scroll-sentinel aria-hidden="true" className="kit-sentinel" />
      <a href="#main" className={`kit-skip ${skipClass}`}>
        Skip to content
      </a>
    </>
  );
}

/** FAQ on <details>, so it works without JavaScript; kit.css animates it. */
export function Faq({
  items,
  className,
  itemClass,
  summaryClass,
  questionClass,
  answerClass,
  icon = <span className="kit-plus" aria-hidden="true" />,
}: {
  items: { question: string; answer: string }[];
  className?: string;
  itemClass?: string;
  summaryClass?: string;
  questionClass?: string;
  answerClass?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <details key={item.question} className={itemClass}>
          <summary className={summaryClass}>
            <h3 className={questionClass}>{item.question}</h3>
            {icon}
          </summary>
          <p className={answerClass}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Sticky call bar on phones; slides in after the first screen (.call-bar in globals.css). */
export function CallBar({
  phone,
  name,
  className,
  children,
}: {
  phone: string;
  name: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`call-bar kit-callbar ${className ?? ""}`}>
      <a href={telHref(phone)} aria-label={`Call ${name} at ${phone}`}>
        {children}
      </a>
    </div>
  );
}

export function year(): number {
  return new Date().getFullYear();
}
