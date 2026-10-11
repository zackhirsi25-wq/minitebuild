import { describe, expect, it } from "vitest";
import { placePhotos } from "@/lib/ai/photos";

describe("photo placement", () => {
  it("falls back to hero, about, feature, detail, then gallery without a suggestion", () => {
    const placed = placePhotos(6, null, "Photo from Test Co");
    expect(placed.map((p) => p.role)).toEqual(["hero", "about", "feature", "detail", "gallery", "gallery"]);
    expect(placed.every((p) => p.alt === "Photo from Test Co")).toBe(true);
  });

  it("keeps a good suggestion and clamps focal points", () => {
    const placed = placePhotos(
      2,
      {
        photos: [
          { index: 1, role: "hero", focal_x: 120, focal_y: -4, alt: "Photo of a clean kitchen counter" },
          { index: 0, role: "detail", focal_x: 30, focal_y: 60, alt: "Close-up of tiles" },
        ],
      },
      "fallback",
    );
    expect(placed[1]).toEqual({ index: 1, role: "hero", focal: [100, 0], alt: "a clean kitchen counter" });
    expect(placed[0].role).toBe("detail");
  });

  it("never repeats a main role, ignores bad indexes and caps the gallery at six", () => {
    const photos = Array.from({ length: 10 }, (_, i) => ({
      index: i,
      role: "hero",
      focal_x: 50,
      focal_y: 50,
      alt: "A roof",
    }));
    photos.push({ index: 42, role: "about", focal_x: 1, focal_y: 1, alt: "nope" });
    const placed = placePhotos(10, { photos }, "fallback");
    expect(placed.filter((p) => p.role === "hero")).toHaveLength(1);
    expect(new Set(placed.map((p) => p.role))).toEqual(new Set(["hero", "about", "feature", "detail", "gallery"]));
    expect(placed.filter((p) => p.role === "gallery")).toHaveLength(6);
    expect(placed.every((p) => p.index < 10)).toBe(true);
  });
});
