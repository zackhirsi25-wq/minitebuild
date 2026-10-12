import { describe, expect, it } from "vitest";
import { businessKind } from "@/lib/sites/seo";

const kind = (name: string, category: string | null = null, trade = "general_contractor") =>
  businessKind({ name, category, trade: trade as "general_contractor" | "remodeling" });

describe("businessKind", () => {
  it("uses Google's category when there is one", () => {
    expect(kind("Peak Co", "roofing contractor")).toEqual({
      label: "Roofing contractor",
      schemaType: "RoofingContractor",
    });
  });

  it("reads the trade from the name when Google has no category", () => {
    expect(kind("Clearwater Plumbing")).toEqual({ label: "Plumber", schemaType: "Plumber" });
    expect(kind("Summit Peak Roofing")).toEqual({ label: "Roofing Contractor", schemaType: "RoofingContractor" });
  });

  it("names non-contractors by their type, not as contractors", () => {
    expect(kind("Luna Hair Studio")).toEqual({ label: "Salon", schemaType: "BeautySalon" });
    expect(kind("Rosa's Bakery")).toEqual({ label: "Restaurant", schemaType: "Restaurant" });
  });

  it("falls back to the stored trade", () => {
    expect(kind("JJ Builders")).toEqual({ label: "General Contractor", schemaType: "GeneralContractor" });
    expect(kind("JJ Builders", null, "remodeling")).toEqual({
      label: "Remodeling",
      schemaType: "HomeAndConstructionBusiness",
    });
  });
});
