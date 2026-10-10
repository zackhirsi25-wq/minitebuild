import type { TemplateMeta } from "../_kit/types";

// Bright fills that all carry Ink (#111) text at 9:1 or better.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "brutal",
  name: "Brutal",
  concept:
    "Neo-brutalist and loud on purpose: thick black outlines, hard offset shadows that press in when tapped, one bright fill.",
  order: 9,
  styles: ["bold", "warm"],
  suits: ["shop", "restaurant", "salon"],
  slots: [
    { slot: "hero", aspect: "4 / 3", label: "Framed hero photo" },
    { slot: "about", aspect: "1 / 1", label: "About (framed square)" },
    { slot: "gallery-1", aspect: "1 / 1", label: "Work 1" },
    { slot: "gallery-2", aspect: "1 / 1", label: "Work 2" },
    { slot: "gallery-3", aspect: "1 / 1", label: "Work 3" },
    { slot: "gallery-4", aspect: "1 / 1", label: "Work 4" },
  ],
  palettes: [
    accent("lemon", "Lemon", "#FFD93D"),
    accent("bubblegum", "Bubblegum", "#FF9EDB"),
    accent("mint", "Mint", "#7EE8B5"),
    accent("lilac", "Lilac", "#C3B1FF"),
    accent("tangerine", "Tangerine", "#FFB347"),
  ],
};

export default meta;
