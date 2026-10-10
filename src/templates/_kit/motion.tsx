"use client";

import { useEffect } from "react";

/**
 * The only client JS on a generated site.
 * - Header: sets data-scrolled once the [data-scroll-sentinel] at the top of
 *   the page leaves the screen (compact, blurred header).
 * - Reveals: where CSS scroll-driven animations exist, adds .motion-sd and CSS
 *   does the rest; elsewhere adds .motion-io and reveals [data-reveal]
 *   elements once with an IntersectionObserver.
 * With prefers-reduced-motion nothing is hidden or animated.
 */
export function SiteMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-site]");
    if (!root) return;
    const observers: IntersectionObserver[] = [];

    const header = root.querySelector<HTMLElement>("[data-site-header]");
    const sentinel = root.querySelector("[data-scroll-sentinel]");
    if (header && sentinel) {
      const io = new IntersectionObserver(([entry]) => header.toggleAttribute("data-scrolled", !entry.isIntersecting));
      io.observe(sentinel);
      observers.push(io);
    }

    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (CSS.supports("animation-timeline: view()")) {
        root.classList.add("motion-sd");
      } else {
        root.classList.add("motion-io");
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          },
          { rootMargin: "0px 0px -8% 0px" },
        );
        root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
        observers.push(io);
      }
    }
    return () => observers.forEach((io) => io.disconnect());
  }, []);
  return null;
}
