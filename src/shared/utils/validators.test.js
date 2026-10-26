import { describe, expect, it } from "vitest";
import { countCharacters, isEmail, isHttpUrl } from "./validators.js";

describe("countCharacters", () => {
  it("counts every letter and space", () => {
    expect(countCharacters("Dragon lore")).toBe(11);
  });

  it("counts an emoji as one character", () => {
    // "🐉".length is 2 in JavaScript; countCharacters counts it once, like the database
    expect(countCharacters("🐉")).toBe(1);
    expect(countCharacters("Fire 🐉")).toBe(6);
  });

  it("returns 0 for an empty text", () => {
    expect(countCharacters("")).toBe(0);
  });
});

describe("isEmail", () => {
  it("accepts a normal email address", () => {
    expect(isEmail("demo@lorelight.app")).toBe(true);
  });

  it("rejects an address without @ or without a dot after it", () => {
    expect(isEmail("demo.lorelight.app")).toBe(false);
    expect(isEmail("demo@lorelight")).toBe(false);
  });

  it("rejects spaces and an empty field", () => {
    expect(isEmail("demo user@lorelight.app")).toBe(false);
    expect(isEmail("   ")).toBe(false);
    expect(isEmail("")).toBe(false);
  });
});

describe("isHttpUrl", () => {
  it("accepts http and https links", () => {
    expect(isHttpUrl("http://example.com/map.png")).toBe(true);
    expect(isHttpUrl("https://example.com/map.png")).toBe(true);
  });

  it("accepts the protocol in any letter case", () => {
    expect(isHttpUrl("HTTPS://example.com/map.png")).toBe(true);
  });

  it("rejects javascript: and ftp: links", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("ftp://example.com/map.png")).toBe(false);
  });

  it("rejects text with spaces", () => {
    expect(isHttpUrl("https://example.com/old map.png")).toBe(false);
    expect(isHttpUrl("a picture of a map")).toBe(false);
  });

  it("rejects a link with nothing after the protocol, and an empty field", () => {
    expect(isHttpUrl("https://")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});
