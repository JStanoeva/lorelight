import { describe, expect, it } from "vitest";
import {
  EMPTY_LORE_VALUES,
  getLoreSaveErrorMessage,
  toLoreFormValues,
  toLorePayload,
  validateLore,
} from "./loreValidation.js";

const ownProjects = ["project-1"];

const validValues = {
  project_id: "project-1",
  folder_id: "",
  title: "The Thirteenth Bell",
  category: "location",
  description: "A bell tower that rings once every hundred years.",
  tagsText: "",
  image_url: "",
  is_public: false,
};

describe("validateLore", () => {
  it("returns no errors for a complete entry", () => {
    expect(validateLore(validValues, ownProjects)).toEqual({});
  });

  it("asks for every required field when the form is empty", () => {
    expect(validateLore(EMPTY_LORE_VALUES, ownProjects)).toEqual({
      project_id: "Choose a project for this entry.",
      title: "Enter a title for your lore entry.",
      category: "Choose a category.",
      description: "Enter a description for your lore entry.",
    });
  });

  it("rejects a project that isn't one of the user's own", () => {
    const errors = validateLore({ ...validValues, project_id: "project-2" }, ownProjects);
    expect(errors.project_id).toBe("Choose one of your own projects.");
  });

  it("rejects a category that isn't one of the 12", () => {
    const errors = validateLore({ ...validValues, category: "dragons" }, ownProjects);
    expect(errors.category).toBe("Choose a category.");
  });

  it("accepts a title of exactly 3 and 100 characters and rejects 2 and 101", () => {
    expect(validateLore({ ...validValues, title: "a".repeat(3) }, ownProjects)).toEqual({});
    expect(validateLore({ ...validValues, title: "a".repeat(100) }, ownProjects)).toEqual({});
    expect(validateLore({ ...validValues, title: "a".repeat(2) }, ownProjects).title).toBe(
      "The title must be at least 3 characters.",
    );
    expect(validateLore({ ...validValues, title: "a".repeat(101) }, ownProjects).title).toBe(
      "The title can be at most 100 characters.",
    );
  });

  it("does not count the spaces at the start and end of the title", () => {
    expect(validateLore({ ...validValues, title: "   " }, ownProjects).title).toBe(
      "Enter a title for your lore entry.",
    );
    expect(validateLore({ ...validValues, title: "  ab  " }, ownProjects).title).toBe(
      "The title must be at least 3 characters.",
    );
  });

  it("accepts a description of exactly 20 and 5,000 characters and rejects 19 and 5,001", () => {
    expect(validateLore({ ...validValues, description: "a".repeat(20) }, ownProjects)).toEqual({});
    expect(validateLore({ ...validValues, description: "a".repeat(5000) }, ownProjects)).toEqual({});
    expect(validateLore({ ...validValues, description: "a".repeat(19) }, ownProjects).description).toBe(
      "The description must be at least 20 characters.",
    );
    expect(validateLore({ ...validValues, description: "a".repeat(5001) }, ownProjects).description).toBe(
      "The description can be at most 5,000 characters.",
    );
  });

  it("accepts an http(s) image link in any letter case and rejects other links", () => {
    const upperCaseLink = { ...validValues, image_url: " HTTP://EXAMPLE.COM/bell.png " };
    const javascriptLink = { ...validValues, image_url: "javascript:alert(1)" };

    expect(validateLore(upperCaseLink, ownProjects)).toEqual({});
    expect(validateLore(javascriptLink, ownProjects).image_url).toBe(
      "Enter a full link that starts with http:// or https://.",
    );
  });
});

describe("toLorePayload", () => {
  it("trims the text, parses the tags and saves empty choices as null", () => {
    const payload = toLorePayload({
      ...validValues,
      title: "  The Thirteenth Bell  ",
      description: "  First paragraph.\n\nSecond paragraph.  ",
      tagsText: "Bell, OLD bell, bell",
      image_url: "   ",
    });

    expect(payload.title).toBe("The Thirteenth Bell");
    expect(payload.description).toBe("First paragraph.\n\nSecond paragraph.");
    expect(payload.tags).toEqual(["bell", "old bell"]);
    expect(payload.folder_id).toBeNull();
    expect(payload.image_url).toBeNull();
  });
});

describe("toLoreFormValues", () => {
  it("turns null into empty text and the tags into one text for the edit form", () => {
    const entry = { ...validValues, folder_id: null, image_url: null, tags: ["bell", "old bell"] };
    expect(toLoreFormValues(entry)).toEqual({ ...validValues, tagsText: "bell, old bell" });
  });
});

describe("getLoreSaveErrorMessage", () => {
  it("explains a project or folder that was deleted while the form was open", () => {
    const projectGone = "The chosen project no longer exists. Choose another project and try again.";
    const projectError = { code: "23503", message: "violates foreign key lore_entries_project_id_fkey" };
    const folderError = { code: "23503", message: "violates foreign key lore_entries_folder_fkey" };

    expect(getLoreSaveErrorMessage(projectError)).toBe(projectGone);
    // 42501: the database only accepts lore in the user's own projects, so the chosen one is gone
    expect(getLoreSaveErrorMessage({ code: "42501" })).toBe(projectGone);
    expect(getLoreSaveErrorMessage(folderError)).toBe(
      'The chosen folder no longer exists. Choose another folder, or "No folder".',
    );
  });
});
