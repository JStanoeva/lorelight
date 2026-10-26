import { describe, expect, it } from "vitest";
import { getFolderErrorMessage, validateFolderName } from "./folderValidation.js";

const folders = [
  { id: "f1", name: "Locations" },
  { id: "f2", name: "Factions" },
];

describe("validateFolderName", () => {
  it("accepts a name that no other folder uses", () => {
    expect(validateFolderName("Artifacts", folders)).toBe("");
  });

  it("asks for a name when it is empty or only spaces", () => {
    expect(validateFolderName("", folders)).toBe("Enter a folder name.");
    expect(validateFolderName("   ", folders)).toBe("Enter a folder name.");
  });

  it("accepts a name of exactly 50 characters and rejects 51", () => {
    expect(validateFolderName("a".repeat(50), folders)).toBe("");
    expect(validateFolderName("a".repeat(51), folders)).toBe("Folder names can be at most 50 characters.");
  });

  it("does not count spaces at the start and end", () => {
    expect(validateFolderName(`  ${"a".repeat(50)}  `, folders)).toBe("");
  });

  it("counts an emoji as one character, like the database does", () => {
    expect(validateFolderName("🐉".repeat(50), folders)).toBe("");
  });

  it("rejects a name another folder uses, ignoring letter case and outer spaces", () => {
    expect(validateFolderName("  LOCATIONS ", folders)).toBe(
      "This project already has a folder with that name.",
    );
  });

  it("lets a renamed folder keep its own name", () => {
    expect(validateFolderName("locations", folders, "f1")).toBe("");
  });

  it("rejects renaming a folder to another folder's name", () => {
    expect(validateFolderName("Factions", folders, "f1")).toBe(
      "This project already has a folder with that name.",
    );
  });
});

describe("getFolderErrorMessage", () => {
  it("explains a duplicate name that the database caught", () => {
    expect(getFolderErrorMessage({ code: "23505" })).toBe(
      "This project already has a folder with that name.",
    );
  });

  it("uses the general messages for other errors", () => {
    expect(getFolderErrorMessage({ code: "42501" })).toBe("You don't have permission to do that.");
    expect(getFolderErrorMessage(null)).toBe("Something went wrong. Please try again.");
  });
});
