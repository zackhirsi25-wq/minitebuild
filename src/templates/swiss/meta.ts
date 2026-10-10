import type { TemplateMeta } from "../_kit/types";

// Accents carry white text at AA.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "swiss",
  name: "Swiss",
  concept: "International style: a strict, visible grid, huge flush-left type, oversized section numbers and one red.",
  order: 8,
  styles: ["light", "bold"],
  suits: ["real-estate", "professional", "contractor", "shop"],
  slots: [
    { slot: "hero", aspect: "3 / 2", label: "Photo that breaks out of the grid to the right" },
    { slot: "about", aspect: "1 / 1", label: "About (square)" },
    { slot: "gallery-1", aspect: "3 / 2", label: "Work 1" },
    { slot: "gallery-2", aspect: "3 / 2", label: "Work 2" },
    { slot: "gallery-3", aspect: "3 / 2", label: "Work 3" },
    { slot: "gallery-4", aspect: "3 / 2", label: "Work 4" },
  ],
  palettes: [
    accent("red", "Swiss red", "#D3191C"),
    accent("blue", "Blue", "#0047BB"),
    accent("green", "Green", "#00704A"),
    accent("orange", "Orange", "#B93F00"),
    accent("black", "Black", "#111111"),
  ],
};

export default meta;
