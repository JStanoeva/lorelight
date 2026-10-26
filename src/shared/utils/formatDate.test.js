import { describe, expect, it } from "vitest";
import { formatDate, formatMonthYear, formatShortMonthYear } from "./formatDate.js";

// The dates have no "Z" at the end, so they are read as local time
// and show the same day in every time zone.

describe("formatDate", () => {
  it("shows the day, the short month and the year", () => {
    expect(formatDate("2026-10-11T12:00:00")).toBe("11 Oct 2026");
  });

  it("returns an empty text for an empty value", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("returns an empty text for a value that is not a date", () => {
    expect(formatDate("not a date")).toBe("");
  });
});

describe("formatMonthYear", () => {
  it("shows the full month and the year", () => {
    expect(formatMonthYear("2026-10-11T12:00:00")).toBe("October 2026");
  });

  it("returns an empty text for an empty or invalid value", () => {
    expect(formatMonthYear(null)).toBe("");
    expect(formatMonthYear("not a date")).toBe("");
  });
});

describe("formatShortMonthYear", () => {
  it("shortens September to Sep, not Sept", () => {
    expect(formatShortMonthYear("2026-09-14T12:00:00")).toBe("Sep 2026");
  });

  it("returns an empty text for an empty or invalid value", () => {
    expect(formatShortMonthYear("")).toBe("");
    expect(formatShortMonthYear("not a date")).toBe("");
  });
});
