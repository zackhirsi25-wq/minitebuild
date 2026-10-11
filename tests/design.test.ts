import { describe, expect, it } from "vitest";
import { chooseTemplate, hsl, paletteForColor } from "@/lib/build/design";
import { allTemplates, templateMeta } from "@/templates";

describe("design choice", () => {
  it("picks a template designed for the business type, stably", () => {
    const templates = allTemplates();
    const a = chooseTemplate(templates, "salon", "studio nine|austin");
    expect(a.suits).toContain("salon");
    expect(chooseTemplate(templates, "salon", "studio nine|austin").id).toBe(a.id);
  });

  it("reads colours", () => {
    expect(hsl("#ff0000")).toMatchObject({ h: 0, s: 1, l: 0.5 });
    expect(hsl("not a colour")).toBeNull();
  });

  it("matches a logo colour to the nearest palette, and ignores greys", () => {
    const meta = templateMeta("impact");
    expect(paletteForColor(meta, "#FFCC00")).toBe("signal");
    expect(paletteForColor(meta, "#2D4BF0")).toBe("cobalt");
    expect(paletteForColor(meta, "#777777")).toBeNull();
  });
});
