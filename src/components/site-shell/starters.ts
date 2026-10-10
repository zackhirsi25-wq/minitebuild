import type { BusinessType } from "@/lib/business-type";

/**
 * Business-type chips under the build box. Each one changes the placeholder
 * examples and passes a type hint to the build. Example names are invented
 * placeholders; the phone uses the 555-01xx range reserved for fiction.
 */
export const STARTERS: { id: string; label: string; type: BusinessType; name: string; city: string }[] = [
  { id: "roofer", label: "Roofer", type: "contractor", name: "Ridgeline Roofing", city: "Denver, CO" },
  { id: "plumber", label: "Plumber", type: "contractor", name: "Clearflow Plumbing", city: "Phoenix, AZ" },
  { id: "electrician", label: "Electrician", type: "contractor", name: "Brightwire Electric", city: "Atlanta, GA" },
  { id: "painter", label: "Painter", type: "contractor", name: "Truecoat Painting", city: "Raleigh, NC" },
  { id: "restaurant", label: "Restaurant", type: "restaurant", name: "Olive & Ash", city: "Portland, OR" },
  { id: "salon", label: "Salon", type: "salon", name: "Studio Nine Hair", city: "Austin, TX" },
  { id: "clinic", label: "Clinic", type: "clinic", name: "Eastside Dental", city: "Chicago, IL" },
  { id: "shop", label: "Shop", type: "shop", name: "Fern & Co. Florist", city: "Seattle, WA" },
];

export const PHONE_PLACEHOLDER = "(555) 010-0142";
