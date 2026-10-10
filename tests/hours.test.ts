import { describe, expect, it } from "vitest";
import { statusAt, statusLabel } from "@/templates/_kit/hours";

const hours = [
  "Monday: 7:00 AM – 6:00 PM",
  "Tuesday: 11:00 AM – 2:00 PM, 5:00 – 10:00 PM",
  "Wednesday: Open 24 hours",
  "Friday: 6:00 PM – 2:00 AM",
  "Sunday: Closed",
];
const at = (day: number, h: number, m = 0) => statusAt(hours, day, h * 60 + m);

describe("opening hours", () => {
  it("reads open and closed times", () => {
    expect(statusLabel(at(1, 9)!)).toBe("Open now · closes 6pm");
    expect(statusLabel(at(1, 6)!)).toBe("Closed · opens 7am");
    expect(statusLabel(at(1, 19)!)).toBe("Closed now");
  });
  it("handles split days, 24 hours, late closing and closed days", () => {
    expect(statusLabel(at(2, 15)!)).toBe("Closed · opens 5pm");
    expect(statusLabel(at(2, 18)!)).toBe("Open now · closes 10pm");
    expect(statusLabel(at(3, 3)!)).toBe("Open 24 hours");
    expect(statusLabel(at(5, 23)!)).toBe("Open now · closes 2am");
    expect(statusLabel(at(0, 12)!)).toBe("Closed today");
  });
  it("returns null for days or text it can't read", () => {
    expect(at(4, 12)).toBeNull();
    expect(statusAt(["Monday: by appointment"], 1, 600)).toBeNull();
  });
});
