import { businessInputSchema, type BusinessInput } from "./schema";
import { splitServices } from "./services";

// CSV import: an RFC 4180 parser plus header detection for name, city, phone
// and an optional services column.
// Shared by the browser (column check before upload) and the server.

export const MAX_IMPORT_ROWS = 2000;

/** Parses CSV text into rows of cells. Handles quotes, "" escapes, CRLF/LF, a BOM and ; or tab delimiters. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"' && cell.trim() === "") {
      cell = "";
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === delimiter) {
      row.push(cell);
      cell = "";
      i++;
      continue;
    }
    if (ch === "\r" || ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += ch === "\r" && text[i + 1] === "\n" ? 2 : 1;
      continue;
    }
    cell += ch;
    i++;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length - 1] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

type RequiredColumn = "name" | "city" | "phone";

const COLUMN_ALIASES: Record<RequiredColumn, string[]> = {
  name: ["name", "business name", "business", "company", "company name", "businessname"],
  city: ["city", "town", "city name"],
  phone: ["phone", "phone number", "telephone", "tel", "phonenumber", "mobile", "number"],
};

const SERVICES_ALIASES = ["services", "service", "services offered", "specialties", "specialty"];

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ");
}

/** Column index for each field; services is -1 when the file has no services column. */
export type ColumnMap = Record<RequiredColumn | "services", number>;

export type ColumnCheck = { ok: true; columns: ColumnMap } | { ok: false; missing: RequiredColumn[]; found: string[] };

export function detectColumns(header: string[]): ColumnCheck {
  const normalized = header.map(normalizeHeader);
  const columns: Partial<ColumnMap> = {};
  const missing: RequiredColumn[] = [];
  for (const key of Object.keys(COLUMN_ALIASES) as RequiredColumn[]) {
    const index = normalized.findIndex((h) => COLUMN_ALIASES[key].includes(h));
    if (index === -1) missing.push(key);
    else columns[key] = index;
  }
  if (missing.length > 0) return { ok: false, missing, found: header.map((h) => h.trim()) };
  columns.services = normalized.findIndex((h) => SERVICES_ALIASES.includes(h));
  return { ok: true, columns: columns as ColumnMap };
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export type ImportRow = {
  /** 1-based row number in the file, counting the header as row 1. */
  rowNumber: number;
  input: BusinessInput;
  /** Plain-language reason the row can't be generated, if any. */
  error?: string;
};

export type ImportParseResult =
  { ok: true; rows: ImportRow[]; validCount: number; invalidCount: number } | { ok: false; error: string };

export function parseImportCsv(text: string): ImportParseResult {
  const table = parseCsv(text);
  const nonEmpty = table.filter((r) => r.some((c) => c.trim() !== ""));
  if (nonEmpty.length === 0) return { ok: false, error: "The file is empty." };

  const headerIndex = table.indexOf(nonEmpty[0]);
  const check = detectColumns(nonEmpty[0]);
  if (!check.ok) {
    const names = check.missing.map((m) => `"${m}"`).join(", ");
    return {
      ok: false,
      error: `The file needs columns named name, city and phone. Missing: ${names}. Found: ${
        check.found.filter(Boolean).join(", ") || "no header row"
      }.`,
    };
  }

  const rows: ImportRow[] = [];
  for (let i = headerIndex + 1; i < table.length; i++) {
    const cells = table[i];
    if (!cells.some((c) => c.trim() !== "")) continue; // blank line, not a business
    const input: BusinessInput = {
      name: (cells[check.columns.name] ?? "").trim(),
      city: (cells[check.columns.city] ?? "").trim(),
      phone: (cells[check.columns.phone] ?? "").trim(),
    };
    const services = check.columns.services === -1 ? [] : splitServices(cells[check.columns.services] ?? "");
    if (services.length > 0) input.services = services;
    const parsed = businessInputSchema.safeParse(input);
    rows.push({
      rowNumber: i + 1,
      input,
      error: parsed.success ? undefined : parsed.error.issues.map((issue) => issue.message).join("; "),
    });
  }

  if (rows.length === 0) return { ok: false, error: "The file has a header row but no businesses." };
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      ok: false,
      error: `The file has ${rows.length} rows. Split it into files of ${MAX_IMPORT_ROWS} rows or fewer.`,
    };
  }

  const invalidCount = rows.filter((r) => r.error).length;
  return { ok: true, rows, validCount: rows.length - invalidCount, invalidCount };
}
