import type { TemplateMeta } from "../_kit/types";

// Light accents on deep navy; all carry Navy (#0B1020) text at 10:1 or better.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "glass",
  name: "Glass",
  concept:
    "Soft colour fields behind frosted glass panels: calm, modern and quiet, made for clinics, studios and wellness.",
  order: 13,
  styles: ["dark", "elegant"],
  suits: ["clinic", "salon", "professional"],
  slots: [
    { slot: "hero", aspect: "16 / 10", label: "Hero in a glass frame" },
    { slot: "about", aspect: "4 / 5", label: "About in a glass frame" },
    { slot: "gallery-1", aspect: "4 / 3", label: "Space 1" },
    { slot: "gallery-2", aspect: "4 / 3", label: "Space 2" },
    { slot: "gallery-3", aspect: "4 / 3", label: "Space 3" },
  ],
  palettes: [
    accent("aqua", "Aqua", "#5EEAD4"),
    accent("lilac", "Lilac", "#C4B5FD"),
    accent("peach", "Peach", "#FDBA74"),
    accent("mint", "Mint", "#86EFAC"),
    accent("sky", "Sky", "#7DD3FC"),
  ],
};

export default meta;
