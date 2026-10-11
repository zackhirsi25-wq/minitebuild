// What kind of business a site is for. It picks the stock photos, the demo
// content in the template gallery and how the copy is written; it never
// changes a template's layout.

export const BUSINESS_TYPES = [
  "contractor",
  "restaurant",
  "salon",
  "clinic",
  "real-estate",
  "shop",
  "professional",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  contractor: "Contractor",
  restaurant: "Restaurant",
  salon: "Salon",
  clinic: "Clinic",
  "real-estate": "Real estate",
  shop: "Shop",
  professional: "Professional services",
};

// Checked in order against the Google category, then the name. Contractor is
// last because words like "design" or "studio" also appear in other trades.
const PATTERNS: [BusinessType, RegExp][] = [
  [
    "restaurant",
    /\brestaurant|\bcaf[eé]\b|\bcoffee|\bbakery|\bbistro|\bdiner\b|\bpizz|\bgrill\b|\bkitchen\s*&\s*bar|\bbar\b|\bbrewer|\btaquer|\bsushi|\bcater|\bfood\b|\beatery/i,
  ],
  [
    "salon",
    /\bsalon|\bbarber|\bhair|\bnail|\bspa\b|\bbeauty|\blash|\bbrow|\bwax|\bmassage|\bstylist|\bcosmet|\btattoo/i,
  ],
  [
    "clinic",
    /\bclinic|\bdent(al|ist)|\bdoctor|\bmedical|\bphysio|\bchiro|\bphysical therap|\boptom|\bvet(erinar)?\b|\bpediatr|\bdermat|\bhealth\s*cent|\borthodon|\bpharmac/i,
  ],
  ["real-estate", /\breal\s*estate|\brealt|\bbroker|\bproperty\s*manage|\bhomes?\s+for\s+sale|\bmortgage/i],
  [
    "professional",
    /\blaw\b|\blawyer|\battorney|\blegal|\baccount|\bcpa\b|\btax\b|\binsurance|\bconsult|\bfinancial|\barchitect|\bnotary|\bagency|\bmarketing/i,
  ],
  [
    "shop",
    /\bstore\b|\bshop\b|\bboutique|\bflorist|\bflowers?\b|\bgifts?\b|\bjewel|\bbook(s|store)|\bclothing|\bapparel|\bhardware|\bpet\s*(store|supply)|\bmarket\b/i,
  ],
];

/**
 * The business type for a name and Google category. Anything that matches
 * nothing is treated as a contractor: that's who the existing imports are.
 */
export function inferBusinessType(name: string, category: string | null): BusinessType {
  for (const source of [category ?? "", name]) {
    if (!source) continue;
    if (
      /contractor|roof|plumb|electric|hvac|remodel|renovat|construct|landscap|paint(ing|er)|handym|concrete|masonry|floor|siding|fenc|deck/i.test(
        source,
      )
    ) {
      return "contractor";
    }
    const hit = PATTERNS.find(([, pattern]) => pattern.test(source));
    if (hit) return hit[0];
  }
  return "contractor";
}

export function isBusinessType(value: unknown): value is BusinessType {
  return typeof value === "string" && (BUSINESS_TYPES as readonly string[]).includes(value);
}
