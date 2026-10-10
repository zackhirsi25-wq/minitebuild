import type { TemplateMeta } from "../_kit/types";

// Accents carry white text at AA and read as text on Linen.
const accent = (id: string, name: string, color: string) => ({ id, name, vars: { accent: color } });

const meta: TemplateMeta = {
  id: "haven",
  name: "Haven",
  concept:
    "Calm and welcoming, for places people visit in person: warm linen, a friendly serif and photos framed in arches like doorways.",
  order: 6,
  styles: ["warm", "light"],
  suits: ["salon", "clinic", "restaurant", "shop"],
  slots: [
    { slot: "hero", aspect: "4 / 5", label: "Arched hero photo" },
    { slot: "about", aspect: "3 / 4", label: "About (arch overlapping the text)" },
    { slot: "detail", aspect: "1 / 1", label: "Small arch beside services" },
    { slot: "gallery-1", aspect: "3 / 4", label: "Arch 1" },
    { slot: "gallery-2", aspect: "3 / 5", label: "Arch 2 (tall)" },
    { slot: "gallery-3", aspect: "3 / 4", label: "Arch 3" },
    { slot: "gallery-4", aspect: "3 / 5", label: "Arch 4 (tall)" },
  ],
  palettes: [
    accent("rosewood", "Rosewood", "#A24E3C"),
    accent("olive", "Olive", "#5D6B2F"),
    accent("dusty-blue", "Dusty blue", "#3F5F7A"),
    accent("plum-rose", "Plum rose", "#8A3E5C"),
    accent("teal", "Teal", "#2D6763"),
  ],
};

export default meta;
