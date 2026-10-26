import { describe, expect, it } from "vitest";
import { getConstellationErrorMessage } from "./constellationErrors.js";

const notPublicMessage =
  "Only public lore can be saved to a Constellation. This entry may have just been made private or deleted.";
const rowLevelSecurityError = {
  code: "42501",
  message: 'new row violates row-level security policy for table "constellation_saves"',
};

describe("getConstellationErrorMessage", () => {
  it("explains a save that Row Level Security refused because the entry isn't public", () => {
    expect(getConstellationErrorMessage(rowLevelSecurityError, "save")).toBe(notPublicMessage);
  });

  it("explains a save of an entry that was deleted on the way (code 23503)", () => {
    expect(getConstellationErrorMessage({ code: "23503", message: "" }, "save")).toBe(notPublicMessage);
  });

  it("keeps the usual permission message for another 42501 error on a save", () => {
    expect(getConstellationErrorMessage({ code: "42501", message: "permission denied" }, "save")).toBe(
      "You don't have permission to do that.",
    );
  });

  it("keeps the usual messages for a removal, because users can always remove their own saves", () => {
    expect(getConstellationErrorMessage(rowLevelSecurityError, "remove")).toBe(
      "You don't have permission to do that.",
    );
    expect(getConstellationErrorMessage({ code: "23503", message: "" }, "remove")).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("falls back to the general message when there is no error object", () => {
    expect(getConstellationErrorMessage(null, "save")).toBe("Something went wrong. Please try again.");
  });
});
