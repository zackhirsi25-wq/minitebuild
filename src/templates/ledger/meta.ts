import type { TemplateMeta } from "../_kit/types";

// Accents carry white text at AA.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "ledger",
  name: "Ledger",
  concept:
    "Plain and exact, like a well-set price list: black on white, monospaced details and services as a typeset index.",
  order: 10,
  styles: ["light", "elegant"],
  suits: ["professional", "clinic", "contractor", "real-estate"],
  slots: [
    { slot: "hero", aspect: "3 / 2", label: "Photo under the masthead (shown in black and white)" },
    { slot: "about", aspect: "3 / 2", label: "About photo (black and white)" },
  ],
  palettes: [
    accent("ink-blue", "Ink blue", "#0F62FE"),
    accent("black", "Black", "#161616"),
    accent("green", "Green", "#198038"),
    accent("red", "Red", "#DA1E28"),
    accent("purple", "Purple", "#6929C4"),
  ],
};

export default meta;
