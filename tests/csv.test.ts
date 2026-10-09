import { describe, expect, it } from "vitest";
import { detectColumns, parseCsv, parseImportCsv } from "@/lib/content/csv";

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quotes, escaped quotes, commas and newlines inside cells", () => {
    const text = 'name,city\n"Smith, Jones & Co","Austin"\n"The ""Best"" Builders","San\nAntonio"\n';
    expect(parseCsv(text)).toEqual([
      ["name", "city"],
      ["Smith, Jones & Co", "Austin"],
      ['The "Best" Builders', "San\nAntonio"],
    ]);
  });

  it("handles CRLF, a BOM and a missing final newline", () => {
    expect(parseCsv("﻿name,city\r\nA,B")).toEqual([
      ["name", "city"],
      ["A", "B"],
    ]);
  });

  it("detects semicolon and tab delimiters", () => {
    expect(parseCsv("name;city;phone\nA;B;C")[1]).toEqual(["A", "B", "C"]);
    expect(parseCsv("name\tcity\tphone\nA\tB\tC")[1]).toEqual(["A", "B", "C"]);
  });

  it("keeps empty cells", () => {
    expect(parseCsv("a,,c\n,,")).toEqual([
      ["a", "", "c"],
      ["", "", ""],
    ]);
  });
});

describe("detectColumns", () => {
  it("finds columns in any order and with common aliases", () => {
    expect(detectColumns(["Phone Number", "City", "Business Name"])).toEqual({
      ok: true,
      columns: { name: 2, city: 1, phone: 0, services: -1 },
    });
    expect(detectColumns(["company_name", "town", "tel"]).ok).toBe(true);
  });

  it("reports missing columns", () => {
    expect(detectColumns(["name", "address"])).toEqual({
      ok: false,
      missing: ["city", "phone"],
      found: ["name", "address"],
    });
  });
});

describe("parseImportCsv", () => {
  it("returns valid rows with row numbers and skips blank lines", () => {
    const result = parseImportCsv(
      "name,city,phone\nElite Remodeling,Austin,(512) 555-0142\n\nJJ General Contractor,Denver,303-555-0187\n",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.validCount).toBe(2);
    expect(result.rows.map((r) => [r.rowNumber, r.input.name])).toEqual([
      [2, "Elite Remodeling"],
      [4, "JJ General Contractor"],
    ]);
  });

  it("marks rows with real errors and gives the reason", () => {
    const result = parseImportCsv("name,city,phone\n,Austin,512-555-0142\nAcme,Dallas,call me\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.invalidCount).toBe(2);
    expect(result.rows[0].error).toBe("Business name is empty");
    expect(result.rows[1].error).toBe("Phone number doesn't look valid");
  });

  it("rejects a file without the right columns, in plain language", () => {
    const result = parseImportCsv("business,address\nAcme,1 Main St");
    expect(result).toEqual({
      ok: false,
      error: 'The file needs columns named name, city and phone. Missing: "city", "phone". Found: business, address.',
    });
  });

  it("rejects empty files and header-only files", () => {
    expect(parseImportCsv("")).toEqual({ ok: false, error: "The file is empty." });
    expect(parseImportCsv("name,city,phone\n")).toEqual({
      ok: false,
      error: "The file has a header row but no businesses.",
    });
  });

  it("tolerates short rows", () => {
    const result = parseImportCsv("name,city,phone\nAcme,Dallas");
    expect(result.ok && result.rows[0].error).toBe("Phone number is empty");
  });
});
