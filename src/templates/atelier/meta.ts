import type { TemplateMeta } from "../_kit/types";

// Accents are used for thin lines and small text on Ivory and carry white text at AA.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "atelier",
  name: "Atelier",
  concept:
    "A fashion house's calm: ivory and black, hairline-thin display type set centred, and a great deal of space.",
  order: 11,
  styles: ["elegant", "light"],
  suits: ["salon", "shop", "real-estate", "professional"],
  slots: [
    { slot: "hero", aspect: "3 / 4", label: "Tall centred portrait" },
    { slot: "about", aspect: "4 / 5", label: "About portrait" },
    { slot: "detail", aspect: "1 / 1", label: "Detail beside services" },
    { slot: "gallery-1", aspect: "3 / 4", label: "Look 1" },
    { slot: "gallery-2", aspect: "3 / 4", label: "Look 2" },
    { slot: "gallery-3", aspect: "3 / 4", label: "Look 3" },
  ],
  palettes: [
    accent("noir", "Noir", "#111111"),
    accent("champagne", "Champagne", "#7A5C2E"),
    accent("bordeaux", "Bordeaux", "#6B1E2C"),
    accent("slate", "Slate", "#3B4552"),
    accent("moss", "Moss", "#3F4A2C"),
  ],
};

export default meta;
