import type { TemplateMeta } from "../_kit/types";

// Accent palettes. Every accent carries Ink (#0E0F11) text at more than 7:1
// and passes 3:1 as a hairline on Ink.
const accent = (id: string, name: string, color: string, soft: string) => ({
  id,
  name,
  vars: { accent: color, "accent-soft": soft },
});

const meta: TemplateMeta = {
  id: "cinematic",
  name: "Cinematic",
  concept: "The business shown like a film still: dark, full-bleed photography, an elegant serif and almost nothing else.",
  order: 1,
  styles: ["dark", "elegant"],
  suits: ["contractor", "real-estate", "restaurant", "professional"],
  slots: [
    { slot: "hero", aspect: "fill", label: "Opening shot (full screen)" },
    { slot: "about", aspect: "fill", label: "About (full width)" },
    { slot: "feature", aspect: "fill", label: "Closing shot (full width)" },
    { slot: "gallery-1", aspect: "4 / 5", label: "Work 1 (large)" },
    { slot: "gallery-2", aspect: "4 / 3", label: "Work 2" },
    { slot: "gallery-3", aspect: "4 / 3", label: "Work 3" },
    { slot: "gallery-4", aspect: "1 / 1", label: "Work 4" },
    { slot: "gallery-5", aspect: "1 / 1", label: "Work 5" },
    { slot: "gallery-6", aspect: "1 / 1", label: "Work 6" },
  ],
  palettes: [
    accent("brass", "Brass", "#C8A46A", "rgb(200 164 106 / 0.16)"),
    accent("ember", "Ember", "#E07A4F", "rgb(224 122 79 / 0.16)"),
    accent("sage", "Sage", "#9DB59A", "rgb(157 181 154 / 0.16)"),
    accent("steel", "Steel", "#8FB3CF", "rgb(143 179 207 / 0.16)"),
    accent("clay", "Clay", "#D69A8C", "rgb(214 154 140 / 0.16)"),
  ],
};

export default meta;
