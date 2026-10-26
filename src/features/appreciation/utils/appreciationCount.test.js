import { describe, expect, it } from "vitest";
import { changeAppreciationCount, formatAppreciationCount, formatPillCount } from "./appreciationCount.js";

describe("changeAppreciationCount", () => {
  it("adds 1 for an appreciation and takes 1 away when it is removed", () => {
    const entry = { id: "a1", appreciation_count: 4 };

    expect(changeAppreciationCount(entry, 1)).toEqual({ id: "a1", appreciation_count: 5 });
    expect(changeAppreciationCount(entry, -1)).toEqual({ id: "a1", appreciation_count: 3 });
  });

  it("never goes below 0, even when the count is out of date", () => {
    expect(changeAppreciationCount({ appreciation_count: 0 }, -1).appreciation_count).toBe(0);
  });

  it("treats a missing count as 0", () => {
    expect(changeAppreciationCount({ id: "a1" }, 1)).toEqual({ id: "a1", appreciation_count: 1 });
  });

  it("leaves the original entry unchanged", () => {
    const entry = { appreciation_count: 2 };
    changeAppreciationCount(entry, 1);

    expect(entry.appreciation_count).toBe(2);
  });
});

describe("formatAppreciationCount", () => {
  it("says there are none yet for 0 and uses the singular for 1", () => {
    expect(formatAppreciationCount(0)).toBe("No appreciations yet");
    expect(formatAppreciationCount(1)).toBe("1 appreciation");
  });

  it("uses the plural and groups large numbers with commas", () => {
    expect(formatAppreciationCount(2)).toBe("2 appreciations");
    expect(formatAppreciationCount(1204)).toBe("1,204 appreciations");
  });
});

describe("formatPillCount", () => {
  it("shows the bare number, grouped with commas", () => {
    expect(formatPillCount(0)).toBe("0");
    expect(formatPillCount(1204)).toBe("1,204");
  });
});
