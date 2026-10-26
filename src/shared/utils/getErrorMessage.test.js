import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./getErrorMessage.js";

describe("getErrorMessage", () => {
  it("explains a failed request as a connection problem", () => {
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });

  it("recognises the network wording of Firefox and Safari", () => {
    expect(getErrorMessage({ message: "NetworkError when attempting to fetch resource." })).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
    expect(getErrorMessage({ message: "Load failed" })).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });

  it("recognises a network error in a plain error object from the database", () => {
    expect(getErrorMessage({ message: "TypeError: Failed to fetch", code: "" })).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });

  it("shows a friendly message for known database error codes", () => {
    expect(getErrorMessage({ message: "JSON object requested", code: "PGRST116" })).toBe(
      "We couldn't find that.",
    );
    expect(getErrorMessage({ message: "permission denied", code: "42501" })).toBe(
      "You don't have permission to do that.",
    );
    expect(getErrorMessage({ message: "duplicate key", code: "23505" })).toBe("That already exists.");
  });

  it("falls back to a general message for an unknown error", () => {
    expect(getErrorMessage({ message: "Something odd", code: "99999" })).toBe(
      "Something went wrong. Please try again.",
    );
    expect(getErrorMessage(new Error("Something odd"))).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("falls back to the general message when there is no error", () => {
    expect(getErrorMessage(null)).toBe("Something went wrong. Please try again.");
  });
});
