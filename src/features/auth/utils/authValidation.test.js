import { describe, expect, it } from "vitest";
import {
  getAuthErrorField,
  getAuthErrorMessage,
  getMatchState,
  getPasswordChecks,
  getPasswordStrength,
  getStrengthSummary,
  validateLogin,
  validateRegister,
} from "./authValidation.js";

const validForm = {
  username: "lanternkeeper",
  email: "name@example.com",
  password: "Lantern1!",
  repeatPassword: "Lantern1!",
};

const usernameCharactersError = "Use only letters (a–z) and numbers, with no spaces.";
const usernameLengthError = "Username must be 3–30 characters.";
const passwordRulesError = "Your password must meet all 5 rules below.";
const passwordTooLongError = "Use at most 72 characters (fewer with accented or non-Latin letters).";

describe("getPasswordChecks", () => {
  it("checks length, uppercase, lowercase, number and special character, in that order", () => {
    const checks = getPasswordChecks("lantern1");

    expect(checks.map((check) => check.id)).toEqual(["length", "uppercase", "lowercase", "number", "special"]);
    expect(checks.map((check) => check.isMet)).toEqual([true, false, true, true, false]);
  });
});

describe("getPasswordStrength", () => {
  it("counts a colon and a backslash as special characters, but not a space", () => {
    expect(getPasswordStrength("Lantern1:")).toBe(5);
    // "\\" is one backslash in JavaScript
    expect(getPasswordStrength("Lantern1\\")).toBe(5);
    expect(getPasswordStrength("Lantern1 ")).toBe(4);
  });
});

describe("getStrengthSummary", () => {
  it("says how many rules are met, and nothing for an empty password", () => {
    expect(getStrengthSummary("", 0)).toBe("");
    expect(getStrengthSummary(" ", 0)).toBe("Very weak. 0 of 5 password rules met.");
    expect(getStrengthSummary("lantern1", 3)).toBe("Fair. 3 of 5 password rules met.");
    expect(getStrengthSummary("Lantern1!", 5)).toBe("Strong. All 5 password rules met.");
  });
});

describe("getMatchState", () => {
  it("says match or mismatch, but stays quiet while the repeat is empty or still the start", () => {
    expect(getMatchState("Lantern1!", "")).toBe("");
    expect(getMatchState("Lantern1!", "Lant")).toBe("");
    expect(getMatchState("Lantern1!", "Lantern1!")).toBe("match");
    expect(getMatchState("Lantern1!", "Lanx")).toBe("mismatch");
  });
});

describe("validateLogin", () => {
  it("asks for both fields, and treats an email of only spaces as empty", () => {
    expect(validateLogin({ email: "   ", password: "" })).toEqual({
      email: "Enter your email address.",
      password: "Enter your password.",
    });
  });

  it("rejects an invalid email, trims a valid one, and skips the password rules, which belong to Register", () => {
    expect(validateLogin({ email: "name@example", password: "x" })).toEqual({
      email: "Enter a valid email address, like name@example.com.",
    });
    expect(validateLogin({ email: " name@example.com ", password: "x" })).toEqual({});
  });
});

describe("validateRegister", () => {
  it("accepts a valid form, in any letter case and with spaces around the username", () => {
    expect(validateRegister(validForm)).toEqual({});
    expect(validateRegister({ ...validForm, username: "  Lantern42 " })).toEqual({});
  });

  it("rejects an empty username and one with spaces or symbols inside", () => {
    expect(validateRegister({ ...validForm, username: "   " }).username).toBe("Enter a username.");
    expect(validateRegister({ ...validForm, username: "lantern keeper" }).username).toBe(usernameCharactersError);
    expect(validateRegister({ ...validForm, username: "lantern_keeper" }).username).toBe(usernameCharactersError);
  });

  it("accepts a username of 3 and 30 characters and rejects 2 and 31", () => {
    expect(validateRegister({ ...validForm, username: "abc" })).toEqual({});
    expect(validateRegister({ ...validForm, username: "a".repeat(30) })).toEqual({});
    expect(validateRegister({ ...validForm, username: "ab" }).username).toBe(usernameLengthError);
    expect(validateRegister({ ...validForm, username: "a".repeat(31) }).username).toBe(usernameLengthError);
  });

  it("asks for a password, and needs at least 8 characters and all 5 rules", () => {
    expect(validateRegister({ ...validForm, password: "" }).password).toBe("Enter a password.");
    expect(validateRegister({ ...validForm, password: "Lore123!", repeatPassword: "Lore123!" })).toEqual({});
    expect(validateRegister({ ...validForm, password: "Lore12!", repeatPassword: "Lore12!" }).password).toBe(
      passwordRulesError,
    );
    expect(validateRegister({ ...validForm, password: "Lantern12", repeatPassword: "Lantern12" }).password).toBe(
      passwordRulesError,
    );
  });

  it("accepts a password of exactly 72 bytes and rejects 73", () => {
    const password72 = `Lantern1!${"a".repeat(63)}`;
    const password73 = `Lantern1!${"a".repeat(64)}`;

    expect(validateRegister({ ...validForm, password: password72, repeatPassword: password72 })).toEqual({});
    expect(validateRegister({ ...validForm, password: password73, repeatPassword: password73 }).password).toBe(
      passwordTooLongError,
    );
  });

  it("counts a Cyrillic letter as 2 bytes, so 41 characters can already be too long", () => {
    const password = `Lantern1!${"я".repeat(32)}`;

    expect(validateRegister({ ...validForm, password, repeatPassword: password }).password).toBe(
      passwordTooLongError,
    );
  });

  it("asks to repeat the password, and never trims it", () => {
    expect(validateRegister({ ...validForm, repeatPassword: "" }).repeatPassword).toBe("Repeat your password.");
    expect(validateRegister({ ...validForm, repeatPassword: "Lantern1! " }).repeatPassword).toBe(
      "Passwords don't match.",
    );
  });
});

describe("getAuthErrorMessage", () => {
  it("turns Supabase errors into readable messages", () => {
    expect(getAuthErrorMessage({ code: "invalid_credentials" })).toBe("Wrong email or password.");
    expect(getAuthErrorMessage({ code: "user_already_exists" })).toBe("An account with this email already exists.");
    expect(getAuthErrorMessage({ code: "weak_password", reasons: ["length", "pwned"] })).toBe(
      "Please choose a stronger password. It is too short. It has appeared in a known data leak, so it isn't safe to use.",
    );
    expect(getAuthErrorMessage({ status: 429 })).toBe("Too many attempts. Please wait a minute and try again.");
  });

  it("explains a username taken a moment ago instead of showing the network message", () => {
    const error = { name: "AuthRetryableFetchError", status: 500, message: "Database error saving new user" };

    expect(getAuthErrorMessage(error)).toBe("That username is no longer available. Please choose another.");
  });
});

describe("getAuthErrorField", () => {
  it("names the field an error is about, or none", () => {
    expect(getAuthErrorField({ message: "Database error saving new user" })).toBe("username");
    expect(getAuthErrorField({ code: "invalid_credentials" })).toBe("password");
    expect(getAuthErrorField({ code: "user_already_exists" })).toBe("email");
    expect(getAuthErrorField(new TypeError("Failed to fetch"))).toBe("");
  });
});
