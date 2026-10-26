import { describe, expect, it } from "vitest";
import {
  EMPTY_PROJECT_VALUES,
  toProjectFormValues,
  toProjectPayload,
  validateProject,
} from "./projectValidation.js";

const validProject = { ...EMPTY_PROJECT_VALUES, title: "The Luminous Divide", format: "novel" };

describe("validateProject", () => {
  it("accepts a complete project without errors", () => {
    expect(validateProject(validProject)).toEqual({});
  });

  it("asks for a title when it is empty or only spaces", () => {
    expect(validateProject({ ...validProject, title: "" })).toEqual({
      title: "Enter a title for your project.",
    });
    expect(validateProject({ ...validProject, title: "   " })).toEqual({
      title: "Enter a title for your project.",
    });
  });

  it("needs at least 3 title characters, not counting outer spaces", () => {
    expect(validateProject({ ...validProject, title: "abc" })).toEqual({});
    expect(validateProject({ ...validProject, title: "  ab  " })).toEqual({
      title: "The title must be at least 3 characters.",
    });
  });

  it("accepts a title of exactly 80 characters and rejects 81", () => {
    expect(validateProject({ ...validProject, title: "a".repeat(80) })).toEqual({});
    expect(validateProject({ ...validProject, title: "a".repeat(81) })).toEqual({
      title: "The title can be at most 80 characters.",
    });
  });

  it("accepts a description of exactly 1,000 characters and rejects 1,001", () => {
    expect(validateProject({ ...validProject, description: "a".repeat(1000) })).toEqual({});
    expect(validateProject({ ...validProject, description: "a".repeat(1001) })).toEqual({
      description: "The description can be at most 1,000 characters.",
    });
  });

  it("accepts only an empty cover link or a full http(s) link", () => {
    const linkError = { cover_url: "Enter a full link that starts with http:// or https://." };

    expect(validateProject({ ...validProject, cover_url: "   " })).toEqual({});
    expect(validateProject({ ...validProject, cover_url: "https://example.com/cover.png" })).toEqual({});
    expect(validateProject({ ...validProject, cover_url: "example.com/cover.png" })).toEqual(linkError);
    expect(validateProject({ ...validProject, cover_url: "javascript:alert(1)" })).toEqual(linkError);
  });

  it("requires a format from the list", () => {
    expect(validateProject({ ...validProject, format: "" })).toEqual({ format: "Choose a format." });
    expect(validateProject({ ...validProject, format: "board_game" })).toEqual({
      format: "Choose a format.",
    });
  });

  it("allows no genre or a listed genre, and rejects others", () => {
    expect(validateProject({ ...validProject, genre: "fantasy" })).toEqual({});
    expect(validateProject({ ...validProject, genre: "elves" })).toEqual({
      genre: "Choose a genre from the list.",
    });
  });
});

describe("toProjectPayload", () => {
  it("trims the text and saves empty optional fields as null", () => {
    const values = {
      title: "  The Luminous Divide  ",
      description: "   ",
      cover_url: "  https://example.com/cover.png  ",
      format: "novel",
      genre: "",
      is_public: true,
    };

    expect(toProjectPayload(values)).toEqual({
      title: "The Luminous Divide",
      description: null,
      cover_url: "https://example.com/cover.png",
      format: "novel",
      genre: null,
      is_public: true,
    });
  });
});

describe("toProjectFormValues", () => {
  it("turns empty database fields into empty text for the edit form", () => {
    const project = { ...validProject, description: null, cover_url: null, genre: null };

    expect(toProjectFormValues(project)).toEqual(validProject);
  });
});

describe("EMPTY_PROJECT_VALUES", () => {
  it("starts a new project as private", () => {
    expect(EMPTY_PROJECT_VALUES.is_public).toBe(false);
  });
});
