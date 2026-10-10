"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";

/** The one navigation for every public page. Collapses to a sheet on phones. */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close the menu when the page changes (adjusting state during render, not in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The sheet is a sibling of <header>, not a child: the header's backdrop-filter
  // would otherwise become the sheet's containing block and squash it.
  return (
    <>
      <header
        className={cx(
          "sticky top-0 z-50 transition-[background-color,border-color] duration-200",
          scrolled || open ? "border-b border-line bg-canvas/80 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[var(--mb-max)] items-center gap-6 px-[var(--mb-gutter)]">
          <Logo />
          <nav aria-label="Main" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="inline-flex h-10 items-center rounded-button px-3 text-small font-medium text-muted transition-colors hover:text-fg aria-[current=page]:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* Neutral, not amber: the accent belongs to each page's own main action. */}
          <div className="hidden md:ml-2 md:block">
            <ButtonLink href="/build" variant="secondary">
              Build my site
            </ButtonLink>
          </div>
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <ButtonLink href="/build" variant="secondary" className="h-10 px-3.5">
              Build
            </ButtonLink>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-button border border-line-strong text-fg"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                {open ? (
                  <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M3.5 7h13M3.5 13h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-canvas px-[var(--mb-gutter)] pt-6 pb-10 md:hidden"
      >
        <nav aria-label="Main">
          <ul className="grid">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-line">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex h-16 items-center justify-between text-lead font-medium text-fg"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ButtonLink href="/build" size="lg" className="mt-8 w-full">
          Build my site
        </ButtonLink>
      </div>
    </>
  );
}
