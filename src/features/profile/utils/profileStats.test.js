import { describe, expect, it } from "vitest";
import {
  getCreatorTitle,
  getProfileStats,
  getRecent,
  getSpotlightProject,
  sortByNewest,
} from "./profileStats.js";

const publicProject = { is_public: true };
const privateProject = { is_public: false };

describe("sortByNewest", () => {
  it("puts the newest item first and leaves the original list as it was", () => {
    const items = [
      { id: "a", updated_at: "2026-10-01" },
      { id: "b", updated_at: "2026-10-20" },
    ];

    expect(sortByNewest(items, "updated_at").map((item) => item.id)).toEqual(["b", "a"]);
    expect(items[0].id).toBe("a");
  });

  it("orders items with the same date by id", () => {
    const items = [
      { id: "b", saved_at: "2026-10-20" },
      { id: "a", saved_at: "2026-10-20" },
    ];

    expect(sortByNewest(items, "saved_at").map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("puts items with a missing or unreadable date last", () => {
    const items = [
      { id: "a", created_at: null },
      { id: "b", created_at: "not a date" },
      { id: "c", created_at: "2026-10-20" },
    ];

    expect(sortByNewest(items, "created_at").map((item) => item.id)).toEqual(["c", "a", "b"]);
  });
});

describe("getRecent", () => {
  it("returns the three newest items by default, or as many as asked for", () => {
    const items = [
      { id: "a", appreciated_at: "2026-10-01" },
      { id: "b", appreciated_at: "2026-10-04" },
      { id: "c", appreciated_at: "2026-10-03" },
      { id: "d", appreciated_at: "2026-10-02" },
    ];

    expect(getRecent(items, "appreciated_at").map((item) => item.id)).toEqual(["b", "c", "d"]);
    expect(getRecent(items, "appreciated_at", 1).map((item) => item.id)).toEqual(["b"]);
  });
});

describe("getProfileStats", () => {
  it("counts the rows and adds up the appreciations, a missing count as 0", () => {
    const stats = getProfileStats({
      projects: [{ id: "p1" }, { id: "p2" }],
      lore: [{ id: "l1", appreciation_count: 2 }, { id: "l2", appreciation_count: 5 }, { id: "l3" }],
      constellation: [{ id: "s1" }],
    });

    expect(stats).toEqual({ projects: 2, lore: 3, appreciationsReceived: 7, saves: 1 });
  });
});

describe("getCreatorTitle", () => {
  it("returns null when no entry is public in a public project", () => {
    expect(getCreatorTitle([])).toBeNull();
    expect(
      getCreatorTitle([
        { id: "a", category: "location", is_public: false, project: publicProject },
        { id: "b", category: "location", is_public: true, project: privateProject },
      ]),
    ).toBeNull();
  });

  it("names the category with the most public lore, so private lore never counts", () => {
    const lore = [
      { id: "a", category: "location", is_public: true, project: publicProject },
      { id: "b", category: "location", is_public: true, project: publicProject },
      { id: "c", category: "character", is_public: true, project: publicProject },
      { id: "d", category: "character", is_public: false, project: publicProject },
      { id: "e", category: "character", is_public: false, project: publicProject },
    ];

    expect(getCreatorTitle(lore)).toEqual({ category: "location", title: "Keeper of Locations" });
  });

  it("breaks a tie with the category of the newest public entry", () => {
    const lore = [
      { id: "a", category: "location", is_public: true, project: publicProject, created_at: "2026-10-01" },
      { id: "b", category: "faction", is_public: true, project: publicProject, created_at: "2026-10-05" },
    ];

    expect(getCreatorTitle(lore)).toEqual({ category: "faction", title: "Chronicler of Factions" });
  });
});

describe("getSpotlightProject", () => {
  it("returns the most recently updated public project, even when a private one is newer", () => {
    const projects = [
      { id: "a", is_public: false, updated_at: "2026-10-20" },
      { id: "b", is_public: true, updated_at: "2026-10-10" },
      { id: "c", is_public: true, updated_at: "2026-10-01" },
    ];

    expect(getSpotlightProject(projects).id).toBe("b");
  });

  it("returns null without a public project", () => {
    expect(getSpotlightProject([])).toBeNull();
    expect(getSpotlightProject([{ id: "a", is_public: false, updated_at: "2026-10-20" }])).toBeNull();
  });
});
