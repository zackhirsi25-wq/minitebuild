import Link from "next/link";
import { product } from "@/config/product";
import { telHref } from "@/lib/content/phone";
import { env } from "@/lib/env";
import { allTemplates } from "@/templates";
import { LogoMark } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-small font-medium text-fg">{title}</h2>
      <ul className="mt-4 grid gap-1">{children}</ul>
    </div>
  );
}

function Item({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-9 items-center text-small text-muted transition-colors hover:text-fg"
      >
        {children}
      </Link>
    </li>
  );
}

/**
 * Footer in four columns. Contact shows SALES_PHONE and CONTACT_EMAIL only when
 * set, and disappears when neither is. Legal lists Credits only until the
 * owner supplies privacy, terms and refund text.
 */
export function SiteFooter() {
  const phone = env.salesPhone;
  const email = env.contactEmail;
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[var(--mb-max)] gap-12 px-[var(--mb-gutter)] py-16 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="grid content-start gap-4">
          <span className="inline-flex items-center gap-2.5 text-fg">
            <LogoMark />
            <span className="text-[17px] font-semibold tracking-[-0.02em] lowercase">{product.name}</span>
          </span>
          <p className="max-w-xs text-small text-muted">A website for your business, built while you wait.</p>
        </div>
        <Column title="Product">
          {NAV_LINKS.map((l) => (
            <Item key={l.href} href={l.href}>
              {l.label}
            </Item>
          ))}
          <Item href="/build">Build my site</Item>
        </Column>
        <Column title="Templates">
          {allTemplates().map((t) => (
            <Item key={t.id} href={`/templates/${t.id}`}>
              {t.name}
            </Item>
          ))}
        </Column>
        <Column title="Company">
          {(phone || email) && (
            <>
              {phone && <Item href={telHref(phone)}>{phone}</Item>}
              {email && <Item href={`mailto:${email}`}>{email}</Item>}
            </>
          )}
          <Item href="/login">Sign in</Item>
        </Column>
        <Column title="Legal">
          <Item href="/credits">Credits</Item>
        </Column>
      </div>
      <div className="mx-auto flex max-w-[var(--mb-max)] flex-wrap items-center justify-between gap-4 border-t border-line px-[var(--mb-gutter)] py-6">
        <p className="text-small text-muted">
          © {year} {product.name}
        </p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
