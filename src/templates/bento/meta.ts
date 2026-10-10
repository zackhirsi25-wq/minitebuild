import type { TemplateMeta } from "../_kit/types";

// Accents carry white text at AA.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "bento",
  name: "Bento",
  concept:
    "Everything at a glance: the page is a grid of soft rounded tiles, with hours, phone and services side by side.",
  order: 7,
  styles: ["light", "bold"],
  suits: ["professional", "clinic", "shop", "contractor"],
  slots: [
    { slot: "hero", aspect: "4 / 3", label: "Photo tile in the opening grid" },
    { slot: "about", aspect: "16 / 9", label: "Wide about tile" },
    { slot: "detail", aspect: "1 / 1", label: "Small square tile" },
    { slot: "gallery-1", aspect: "1 / 1", label: "Work 1" },
    { slot: "gallery-2", aspect: "1 / 1", label: "Work 2" },
    { slot: "gallery-3", aspect: "1 / 1", label: "Work 3" },
    { slot: "gallery-4", aspect: "1 / 1", label: "Work 4" },
  ],
  palettes: [
    accent("cobalt", "Cobalt", "#1D4ED8"),
    accent("rust", "Rust", "#C2410C"),
    accent("emerald", "Emerald", "#047857"),
    accent("berry", "Berry", "#BE185D"),
    accent("violet", "Violet", "#5B21B6"),
  ],
};

export default meta;
