import Link from "next/link";
import { cx } from "./cx";

/** Tabs as links, so the selected tab lives in the URL (?tab=content) and survives a reload. */
export function Tabs({
  tabs,
  current,
  label,
}: {
  tabs: { id: string; label: string; href: string }[];
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 border-b border-line px-1">
        {tabs.map((tab) => {
          const selected = tab.id === current;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={selected ? "page" : undefined}
                className={cx(
                  "relative inline-flex h-11 items-center px-3 text-small font-medium transition-colors",
                  selected
                    ? "text-fg after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-fg"
                    : "text-muted hover:text-fg",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
