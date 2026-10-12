import { describe, expect, it } from "vitest";
import { imagePaths } from "@/lib/housekeeping";

describe("housekeeping", () => {
  it("finds every stored photo path in a business's images", () => {
    const images = {
      hero: { path: "drafts/abc/1.webp", alt: "Roof", focal: [50, 50] },
      logo: { path: "biz-1/logo-1.png", alt: "Logo" },
      gallery: [{ path: "drafts/abc/2.webp", alt: "a" }, { alt: "no path" }],
      about: null,
    };
    expect(imagePaths(images).sort()).toEqual(["biz-1/logo-1.png", "drafts/abc/1.webp", "drafts/abc/2.webp"]);
  });

  it("returns nothing for empty or malformed images", () => {
    expect(imagePaths({})).toEqual([]);
    expect(imagePaths(null)).toEqual([]);
    expect(imagePaths("drafts/x.webp")).toEqual([]);
  });
});
