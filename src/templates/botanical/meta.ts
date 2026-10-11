import type { TemplateMeta } from "../_kit/types";

// Accents carry white text at AA and read as text on Oat.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "botanical",
  name: "Botanical",
  concept:
    "Earthy and natural: oat and deep green, a soft serif, and photos framed in leaf shapes that grow out of the grid.",
  order: 14,
  styles: ["warm", "light", "elegant"],
  suits: ["shop", "salon", "clinic", "contractor"],
  slots: [
    { slot: "hero", aspect: "4 / 5", label: "Large leaf frame" },
    { slot: "detail", aspect: "1 / 1", label: "Small leaf overlapping the large one" },
    { slot: "about", aspect: "4 / 5", label: "About leaf frame" },
    { slot: "gallery-1", aspect: "1 / 1", label: "Leaf 1" },
    { slot: "gallery-2", aspect: "1 / 1", label: "Leaf 2" },
    { slot: "gallery-3", aspect: "1 / 1", label: "Leaf 3" },
  ],
  palettes: [
    accent("forest", "Forest", "#2F5D3A"),
    accent("terracotta", "Terracotta", "#A4502F"),
    accent("plum", "Plum", "#6B3A5B"),
    accent("ochre", "Ochre", "#7C5E14"),
    accent("teal", "Teal", "#2B5F5C"),
  ],
};

export default meta;
