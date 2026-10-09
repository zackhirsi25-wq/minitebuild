// Which kind of work a business does, read from its name and Google category.
// "X Roofing" should get roofing services, not kitchens. The specialty steers
// Claude's service list; the example services are what the fixture copy uses
// when there is no API key.

export type Specialty = {
  id: string;
  /** How the work is described to Claude, e.g. "roofing". */
  label: string;
  pattern: RegExp;
  examples: string[];
};

// Order matters: a name that matches several ("Roofing & Remodeling") gets the
// first one listed here.
export const SPECIALTIES: Specialty[] = [
  {
    id: "roofing",
    label: "roofing",
    pattern: /\broof/i,
    examples: ["Roof Replacement", "Roof Repair", "Storm Damage Repair", "Roof Inspections", "Gutters"],
  },
  {
    id: "siding",
    label: "siding and gutters",
    pattern: /\bsiding\b|\bgutter/i,
    examples: ["Siding Installation", "Siding Repair", "Gutter Installation", "Soffit and Fascia"],
  },
  {
    id: "windows",
    label: "windows and doors",
    pattern: /\bwindows?\b|\bdoors?\b/i,
    examples: ["Window Replacement", "Entry Doors", "Patio Doors", "Window and Door Repair"],
  },
  {
    id: "plumbing",
    label: "plumbing",
    pattern: /\bplumb/i,
    examples: ["Leak Repair", "Water Heaters", "Drain Cleaning", "Fixture Installation", "Repiping"],
  },
  {
    id: "electrical",
    label: "electrical work",
    pattern: /\belectric/i,
    examples: ["Panel Upgrades", "Wiring and Rewiring", "Lighting Installation", "Outlets and Switches"],
  },
  {
    id: "hvac",
    label: "heating and air conditioning",
    pattern: /\bhvac\b|\bheating\b|\bair condition|\bcooling\b|\bfurnace/i,
    examples: ["AC Repair", "Furnace Repair", "System Replacement", "Maintenance Visits"],
  },
  {
    id: "concrete",
    label: "concrete and masonry",
    pattern: /\bconcrete\b|\bmasonry\b|\bpaving\b|\bpavers?\b|\bbrick/i,
    examples: ["Driveways", "Patios", "Walkways", "Retaining Walls", "Concrete Repair"],
  },
  {
    id: "decks",
    label: "decks and fences",
    pattern: /\bdecks?\b|\bfenc/i,
    examples: ["Deck Building", "Deck Repair", "Fence Installation", "Fence Repair"],
  },
  {
    id: "painting",
    label: "painting",
    pattern: /\bpaint/i,
    examples: ["Interior Painting", "Exterior Painting", "Cabinet Painting", "Drywall Patching"],
  },
  {
    id: "flooring",
    label: "flooring",
    pattern: /\bfloor/i,
    examples: ["Hardwood Flooring", "Tile Installation", "Luxury Vinyl Plank", "Floor Refinishing"],
  },
  {
    id: "landscaping",
    label: "landscaping",
    pattern: /\blandscap|\blawn\b|\bhardscap/i,
    examples: ["Landscape Design", "Planting", "Hardscaping", "Yard Cleanup"],
  },
  {
    id: "handyman",
    label: "handyman repairs",
    pattern: /\bhandym[ae]n\b/i,
    examples: ["Home Repairs", "Drywall Repair", "Fixture Installation", "Doors and Trim"],
  },
  {
    id: "remodeling",
    label: "kitchen, bath and home remodeling",
    pattern: /\bremodel|\brenovat|\bkitchen|\bbath/i,
    examples: ["Kitchen Remodeling", "Bathroom Remodeling", "Basement Finishing", "Interior Updates"],
  },
];

/**
 * The specialty the business name points to, else the one the Google category
 * points to, else null (no signal: a general list is fine).
 */
export function inferSpecialty(name: string, category: string | null): Specialty | null {
  for (const source of [name, category ?? ""]) {
    const hit = SPECIALTIES.find((s) => s.pattern.test(source));
    if (hit) return hit;
  }
  return null;
}

export const MAX_INPUT_SERVICES = 6;

/** Splits a CSV "services" cell: "Roof repair; Gutters" (also | or newlines, or commas if nothing else). */
export function splitServices(cell: string): string[] {
  const parts = /[;|\n]/.test(cell) ? cell.split(/[;|\n]/) : cell.split(",");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const item = part.trim().replace(/\s+/g, " ");
    const key = serviceKey(item);
    if (!item || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Compares service titles loosely: case, punctuation and "&" vs "and" don't matter. */
export function serviceKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
