import { Onest } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/site-shell/logo";

// The build flow: one task per screen, so the site nav steps aside. The logo
// and "Save and exit" stay; progress is saved on every step.

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

export default function BuildLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`mb ${onest.variable} flex min-h-dvh flex-col`}>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[var(--mb-max)] items-center justify-between gap-4 px-[var(--mb-gutter)]">
          <Logo />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-small font-medium text-muted transition-colors hover:text-fg"
          >
            Save and exit
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
