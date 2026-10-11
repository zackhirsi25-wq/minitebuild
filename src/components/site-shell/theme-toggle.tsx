"use client";

import { useSyncExternalStore } from "react";

const KEY = "mb-theme";

/** Runs before first paint (inline in the layout) so a saved light theme never flashes dark. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light")document.currentScript.parentElement.setAttribute("data-theme","light")}catch(e){}`;

type Theme = "dark" | "light";

// The theme lives on the .mb root's data-theme attribute; this reads it as an
// external store so the toggle stays in sync without effects.
function subscribe(onChange: () => void) {
  const root = document.querySelector(".mb");
  if (!root) return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const readTheme = (): Theme =>
  document.querySelector(".mb")?.getAttribute("data-theme") === "light" ? "light" : "dark";
const serverTheme = (): Theme => "dark";

/** Dark/light switch for the Minitebuild site. The choice is remembered in this browser only. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => {
        document.querySelector(".mb")?.setAttribute("data-theme", next);
        try {
          localStorage.setItem(KEY, next);
        } catch {}
      }}
      className="inline-flex min-h-11 items-center gap-2 text-small text-muted transition-colors hover:text-fg"
    >
      <span aria-hidden="true" className="relative h-4 w-4 overflow-hidden rounded-full border border-current">
        <span
          className={
            theme === "dark"
              ? "absolute inset-y-0 right-0 w-1/2 bg-current"
              : "absolute inset-y-0 left-0 w-1/2 bg-current"
          }
        />
      </span>
      {theme === "dark" ? "Light theme" : "Dark theme"}
    </button>
  );
}
