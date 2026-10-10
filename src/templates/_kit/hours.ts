// Google opening hours look like "Monday: 7:00 AM – 6:00 PM", "Sunday: Closed"
// or "Friday: Open 24 hours" (sometimes with two ranges, "11:00 AM – 2:00 PM,
// 5:00 – 10:00 PM"). Anything unreadable gives null and the UI hides itself.

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type DayStatus =
  | { kind: "open"; closesAt: string }
  | { kind: "closed-now"; opensAt: string | null }
  | { kind: "closed-today" }
  | { kind: "always" };

function toMinutes(time: string, fallbackMeridiem: string | null): number | null {
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = Number(m[1]) % 12;
  const meridiem = (m[3] ?? fallbackMeridiem)?.toUpperCase();
  if (!meridiem) return null;
  if (meridiem === "PM") hour += 12;
  return hour * 60 + Number(m[2] ?? 0);
}

function short(time: string): string {
  return time
    .trim()
    .replace(/:00/, "")
    .replace(/\s*(AM|PM)/i, (_, m: string) => m.toLowerCase());
}

/** The hours line for a weekday (0 = Sunday), or null. */
export function lineFor(hours: string[], weekday: number): string | null {
  const day = DAYS[weekday];
  const line = hours.find((l) => l.startsWith(`${day}:`));
  return line ? line.slice(day.length + 1).trim() : null;
}

/** Whether the business is open at `minutes` past midnight on `weekday`, from its hours. */
export function statusAt(hours: string[], weekday: number, minutes: number): DayStatus | null {
  const text = lineFor(hours, weekday);
  if (!text) return null;
  if (/^closed$/i.test(text)) return { kind: "closed-today" };
  if (/24 hours/i.test(text)) return { kind: "always" };
  const ranges = text.split(/,\s*/).map((r) => r.split(/\s*[–-]\s*/));
  let nextOpen: string | null = null;
  for (const [start, end] of ranges) {
    if (!start || !end) return null;
    const endMeridiem = end.match(/(AM|PM)/i)?.[1] ?? null;
    const from = toMinutes(start, endMeridiem);
    let to = toMinutes(end, null);
    if (from === null || to === null) return null;
    if (to <= from) to += 24 * 60; // closes after midnight
    if (minutes >= from && minutes < to) return { kind: "open", closesAt: short(end) };
    if (minutes < from && !nextOpen) nextOpen = short(start.match(/(AM|PM)/i) ? start : `${start} ${endMeridiem}`);
  }
  return { kind: "closed-now", opensAt: nextOpen };
}

export function statusLabel(status: DayStatus): string {
  switch (status.kind) {
    case "open":
      return `Open now · closes ${status.closesAt}`;
    case "always":
      return "Open 24 hours";
    case "closed-today":
      return "Closed today";
    case "closed-now":
      return status.opensAt ? `Closed · opens ${status.opensAt}` : "Closed now";
  }
}
