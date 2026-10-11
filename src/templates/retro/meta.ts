import type { TemplateMeta } from "../_kit/types";

// Warm fills that all carry Brown (#2B1A10) text at 6:1 or better.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "retro",
  name: "Retro",
  concept:
    "Seventies warmth: rounded serif type, cream and brown, and sunburst stripes radiating behind a round photo.",
  order: 12,
  styles: ["warm", "bold"],
  suits: ["restaurant", "shop", "salon", "contractor"],
  slots: [
    { slot: "hero", aspect: "1 / 1", label: "Round hero photo" },
    { slot: "about", aspect: "4 / 5", label: "About (rounded corners)" },
    { slot: "gallery-1", aspect: "1 / 1", label: "Round 1" },
    { slot: "gallery-2", aspect: "1 / 1", label: "Round 2" },
    { slot: "gallery-3", aspect: "1 / 1", label: "Round 3" },
  ],
  palettes: [
    accent("tangerine", "Tangerine", "#F7931E"),
    accent("mustard", "Mustard", "#F2B632"),
    accent("avocado", "Avocado", "#A9B84E"),
    accent("teal", "Teal", "#55B8AD"),
    accent("coral", "Coral", "#F4845F"),
  ],
};

export default meta;
