import type { TemplateMeta } from "../_kit/types";

// Accents carry Umber (#1C1B19) text at AA and pass 3:1 as fills on Dusk.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "story",
  name: "Story",
  concept:
    "Scroll storytelling: one photo stays pinned like a stage and changes scene as the reader moves through each chapter.",
  order: 5,
  styles: ["story", "dark", "warm"],
  suits: ["real-estate", "restaurant", "salon", "contractor"],
  slots: [
    { slot: "hero", aspect: "4 / 5", label: "Opening scene" },
    { slot: "feature", aspect: "4 / 5", label: "Chapter 1 scene" },
    { slot: "about", aspect: "4 / 5", label: "Chapter 2 scene" },
    { slot: "detail", aspect: "4 / 5", label: "Chapter 3 scene" },
    { slot: "gallery-1", aspect: "4 / 3", label: "Work 1" },
    { slot: "gallery-2", aspect: "4 / 3", label: "Work 2" },
    { slot: "gallery-3", aspect: "4 / 3", label: "Work 3" },
    { slot: "gallery-4", aspect: "4 / 3", label: "Work 4" },
  ],
  palettes: [
    accent("amber", "Amber", "#E8A33D"),
    accent("coral", "Coral", "#EF7B62"),
    accent("mint", "Mint", "#7CC6A4"),
    accent("sky", "Sky", "#7FB2F0"),
    accent("lilac", "Lilac", "#B9A3E8"),
  ],
};

export default meta;
