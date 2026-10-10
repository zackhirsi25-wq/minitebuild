import Link from "next/link";
import { product } from "@/config/product";

/** The Minitebuild mark: a page with a doorway cut out. Drawn in the text colour, never the accent. */
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5 2.5h14A2.5 2.5 0 0 1 21.5 5v14a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 19V5A2.5 2.5 0 0 1 5 2.5Zm4.5 19v-6a2.5 2.5 0 0 1 5 0v6h-5ZM6 6.5h12V8H6V6.5Z"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 text-fg" aria-label={`${product.name} home`}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-[-0.02em] lowercase">{product.name}</span>
    </Link>
  );
}
