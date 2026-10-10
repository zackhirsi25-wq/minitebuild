import type { TemplateMeta } from "../_kit/types";

// Accents carry white text at AA (4.5:1 or better) and read clearly on Paper.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "gallery",
  name: "Gallery",
  concept:
    "An exhibition catalogue: huge, quiet type on white paper, with photos hung like framed prints and labelled.",
  order: 2,
  styles: ["light", "elegant"],
  suits: ["shop", "professional", "real-estate", "salon"],
  slots: [
    { slot: "hero", aspect: "16 / 9", label: "Framed print under the headline" },
    { slot: "about", aspect: "4 / 5", label: "About (bleeds off the edge)" },
    { slot: "gallery-1", aspect: "4 / 5", label: "Work 1" },
    { slot: "gallery-2", aspect: "1 / 1", label: "Work 2" },
    { slot: "gallery-3", aspect: "3 / 4", label: "Work 3" },
    { slot: "gallery-4", aspect: "4 / 3", label: "Work 4" },
    { slot: "gallery-5", aspect: "1 / 1", label: "Work 5" },
    { slot: "gallery-6", aspect: "4 / 5", label: "Work 6" },
  ],
  palettes: [
    accent("ultramarine", "Ultramarine", "#2F45D0"),
    accent("forest", "Forest", "#1F5C44"),
    accent("terracotta", "Terracotta", "#B4472A"),
    accent("plum", "Plum", "#5B2A6E"),
    accent("teal", "Deep teal", "#0F5E6B"),
  ],
};

export default meta;
