import type { TemplateMeta } from "../_kit/types";

// Each accent comes with the text colour that passes AA on it.
const accent = (id: string, name: string, color: string, on: string) => ({
  id,
  name,
  vars: { accent: color, "on-accent": on },
});

const meta: TemplateMeta = {
  id: "impact",
  name: "Impact",
  concept:
    "A work poster: condensed headlines at full width, black and white, one signal colour and a hard visible grid.",
  order: 3,
  styles: ["bold", "dark"],
  suits: ["contractor", "professional", "shop"],
  slots: [
    { slot: "hero", aspect: "4 / 5", label: "Hero (right half, bleeds off the edge)" },
    { slot: "about", aspect: "4 / 3", label: "About (overlaps the section edge)" },
    { slot: "gallery-1", aspect: "1 / 1", label: "Work 1" },
    { slot: "gallery-2", aspect: "1 / 1", label: "Work 2" },
    { slot: "gallery-3", aspect: "1 / 1", label: "Work 3" },
    { slot: "gallery-4", aspect: "1 / 1", label: "Work 4" },
    { slot: "gallery-5", aspect: "1 / 1", label: "Work 5" },
    { slot: "gallery-6", aspect: "1 / 1", label: "Work 6" },
  ],
  palettes: [
    accent("signal", "Signal yellow", "#FFD400", "#0A0A0A"),
    accent("orange", "Safety orange", "#FF5A1F", "#0A0A0A"),
    accent("lime", "Lime", "#C6F432", "#0A0A0A"),
    accent("cobalt", "Cobalt", "#3D5AFE", "#FFFFFF"),
    accent("red", "Fire red", "#E3262B", "#FFFFFF"),
  ],
};

export default meta;
