import { describe, expect, it } from "vitest";
import { getAppreciationErrorMessage } from "./appreciationErrors.js";

const notPublicMessage =
  "Only public lore can be appreciated. This entry may have just been made private or deleted.";

describe("getAppreciationErrorMessage", () => {
  it("explains a row-level security refusal: the entry is no longer public", () => {
    const error = {
      code: "42501",
      message: 'new row violates row-level security policy for table "appreciations"',
    };

    expect(getAppreciationErrorMessage(error)).toBe(notPublicMessage);
  });

  it("keeps the usual permission message for other 42501 errors", () => {
    const error = { code: "42501", message: "permission denied for table appreciations" };

    expect(getAppreciationErrorMessage(error)).toBe("You don't have permission to do that.");
  });

  it("gives the same explanation when the entry was deleted while saving", () => {
    expect(getAppreciationErrorMessage({ code: "23503" })).toBe(notPublicMessage);
  });

  it("falls back to the general message for unknown errors", () => {
    expect(getAppreciationErrorMessage({ code: "XX000" })).toBe("Something went wrong. Please try again.");
    expect(getAppreciationErrorMessage(null)).toBe("Something went wrong. Please try again.");
  });
});
