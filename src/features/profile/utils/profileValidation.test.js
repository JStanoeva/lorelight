import { describe, expect, it } from "vitest";
import { toProfileFormValues, toProfilePayload, validateProfile } from "./profileValidation.js";

const validValues = { display_name: "Mira Vale", bio: "", avatar_url: "", star_color: "gold" };

describe("validateProfile", () => {
  it("accepts an empty bio and avatar link, also when they are only spaces", () => {
    expect(validateProfile(validValues)).toEqual({});
    expect(validateProfile({ ...validValues, bio: "   ", avatar_url: "   " })).toEqual({});
  });

  it("requires a display name, and spaces alone don't count", () => {
    expect(validateProfile({ ...validValues, display_name: "" })).toEqual({
      display_name: "Enter a display name.",
    });
    expect(validateProfile({ ...validValues, display_name: "   " })).toEqual({
      display_name: "Enter a display name.",
    });
  });

  it("accepts a display name of exactly 50 characters and rejects 51", () => {
    expect(validateProfile({ ...validValues, display_name: "a".repeat(50) })).toEqual({});
    expect(validateProfile({ ...validValues, display_name: "a".repeat(51) })).toEqual({
      display_name: "The display name can be at most 50 characters.",
    });
  });

  it("removes spaces at the start and end before counting the display name", () => {
    expect(validateProfile({ ...validValues, display_name: `  ${"a".repeat(50)}  ` })).toEqual({});
  });

  it("accepts a bio of exactly 500 characters and rejects 501", () => {
    expect(validateProfile({ ...validValues, bio: "a".repeat(500) })).toEqual({});
    expect(validateProfile({ ...validValues, bio: "a".repeat(501) })).toEqual({
      bio: "The bio can be at most 500 characters.",
    });
  });

  it("counts an emoji as one character, like the database", () => {
    // "🌙".length is 2 in JavaScript, so 500 moons would be 1,000 if counted with .length
    expect(validateProfile({ ...validValues, bio: "🌙".repeat(500) })).toEqual({});
  });

  it("accepts only a full http:// or https:// avatar link", () => {
    expect(validateProfile({ ...validValues, avatar_url: "https://example.com/me.png" })).toEqual({});
    expect(validateProfile({ ...validValues, avatar_url: "javascript:alert(1)" })).toEqual({
      avatar_url: "Enter a full link that starts with http:// or https://.",
    });
  });

  it("accepts one of the six star colours and rejects anything else", () => {
    const error = { star_color: "Choose one of the star colours." };

    expect(validateProfile({ ...validValues, star_color: "silver" })).toEqual({});
    expect(validateProfile({ ...validValues, star_color: "orange" })).toEqual(error);
    expect(validateProfile({ ...validValues, star_color: "Teal" })).toEqual(error);
  });
});

describe("toProfilePayload", () => {
  it("trims the text and saves an empty bio and avatar link as null", () => {
    expect(
      toProfilePayload({ display_name: " Mira Vale ", bio: "  ", avatar_url: "", star_color: "teal" }),
    ).toEqual({ display_name: "Mira Vale", bio: null, avatar_url: null, star_color: "teal" });
    expect(toProfilePayload({ ...validValues, bio: " Keeper of maps. " }).bio).toBe("Keeper of maps.");
  });
});

describe("toProfileFormValues", () => {
  it("turns empty fields from the database into empty text for the inputs", () => {
    expect(
      toProfileFormValues({ display_name: "Mira Vale", bio: null, avatar_url: null, star_color: "violet" }),
    ).toEqual({ avatar_url: "", display_name: "Mira Vale", bio: "", star_color: "violet" });
  });

  it("falls back to Lantern Gold for an unknown star colour", () => {
    expect(toProfileFormValues({ ...validValues, star_color: "orange" }).star_color).toBe("gold");
  });
});
