import type { TemplateMeta } from "../_kit/types";

// Accents carry white text at AA and read as text on Cream.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "editorial",
  name: "Editorial",
  concept:
    "A weekend magazine: a cream page, a tall serif masthead, numbered chapters and dark spreads between light ones.",
  order: 4,
  styles: ["elegant", "light", "warm"],
  suits: ["restaurant", "salon", "real-estate", "shop"],
  slots: [
    { slot: "hero", aspect: "4 / 5", label: "Cover portrait" },
    { slot: "about", aspect: "3 / 4", label: "Spread photo (hangs into the margin)" },
    { slot: "gallery-1", aspect: "3 / 4", label: "Contact sheet 1" },
    { slot: "gallery-2", aspect: "3 / 4", label: "Contact sheet 2" },
    { slot: "gallery-3", aspect: "3 / 4", label: "Contact sheet 3" },
    { slot: "gallery-4", aspect: "3 / 4", label: "Contact sheet 4" },
    { slot: "gallery-5", aspect: "3 / 4", label: "Contact sheet 5" },
    { slot: "gallery-6", aspect: "3 / 4", label: "Contact sheet 6" },
  ],
  palettes: [
    accent("oxblood", "Oxblood", "#7A1F2B"),
    accent("bottle", "Bottle green", "#24513F"),
    accent("navy", "Navy", "#1F3557"),
    accent("sienna", "Burnt sienna", "#8E3B1F"),
    accent("aubergine", "Aubergine", "#4A2545"),
  ],
};

export default meta;
