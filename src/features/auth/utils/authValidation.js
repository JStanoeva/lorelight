import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { countCharacters, isEmail } from "../../../shared/utils/validators.js";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 8;
// Supabase's limit is 72 bytes; every allowed character (hasOnlyAllowedCharacters) is 1 byte,
// so 72 bytes = 72 characters.
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_RULE_COUNT = 5;

export const USERNAME_TAKEN_MESSAGE = "That username is already taken. Please choose another.";
const EMAIL_TAKEN_MESSAGE = "An account with this email already exists.";
export const NO_SESSION_MESSAGE =
  "Please confirm your email address (check your inbox), then log in.";

const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;

// The exact set Supabase Auth's password policy counts as symbols (backslash and colon, no space)
const SPECIAL_CHARACTERS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

function hasOnlyAllowedCharacters(password) {
  return Array.from(password).every(
    (character) => /[A-Za-z0-9]/.test(character) || SPECIAL_CHARACTERS.includes(character),
  );
}

// Index 0 is used for 0 and 1 met rules: a password with text is never "Not set".
const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];

export function getPasswordChecks(password) {
  return [
    {
      id: "length",
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      // An emoji counts as one character (.length would say two)
      isMet: countCharacters(password) >= PASSWORD_MIN_LENGTH,
    },
    { id: "uppercase", label: "One uppercase letter", isMet: /[A-Z]/.test(password) },
    { id: "lowercase", label: "One lowercase letter", isMet: /[a-z]/.test(password) },
    { id: "number", label: "One number", isMet: /[0-9]/.test(password) },
    {
      id: "special",
      label: "One special character",
      isMet: Array.from(password).some((character) => SPECIAL_CHARACTERS.includes(character)),
    },
  ];
}

export function getPasswordStrength(password) {
  return getPasswordChecks(password).filter((check) => check.isMet).length;
}

export function getStrengthLabel(password, strength) {
  if (password === "") {
    return "Not set";
  }

  return STRENGTH_LABELS[Math.max(strength, 1) - 1];
}

export function getStrengthSummary(password, strength) {
  if (password === "") {
    return "";
  }

  if (strength === PASSWORD_RULE_COUNT) {
    return `Strong. All ${PASSWORD_RULE_COUNT} password rules met.`;
  }

  const label = getStrengthLabel(password, strength);
  return `${label}. ${strength} of ${PASSWORD_RULE_COUNT} password rules met.`;
}

// Stays quiet ("") while the repeat is still the start of the password: it's being typed.
export function getMatchState(password, repeatPassword) {
  if (repeatPassword === "") {
    return "";
  }

  if (repeatPassword === password) {
    return "match";
  }

  if (password.startsWith(repeatPassword)) {
    return "";
  }

  return "mismatch";
}

function getEmailError(email) {
  if (email === "") {
    return "Enter your email address.";
  }

  if (!isEmail(email)) {
    return "Enter a valid email address, like name@example.com.";
  }

  return "";
}

// Login only checks that a password was entered: the password rules belong to registration.
export function validateLogin({ email, password }) {
  const errors = {};
  const emailError = getEmailError(email.trim());

  if (emailError) {
    errors.email = emailError;
  }

  if (password === "") {
    errors.password = "Enter your password.";
  }

  return errors;
}

// Passwords are never trimmed, so a space is rejected instead of silently removed.
export function validateRegister({ username, email, password, repeatPassword }) {
  const errors = {};
  const trimmedUsername = username.trim();
  const emailError = getEmailError(email.trim());

  if (trimmedUsername === "") {
    errors.username = "Enter a username.";
  } else if (!USERNAME_PATTERN.test(trimmedUsername)) {
    errors.username = "Use only Latin letters (a–z) and numbers, with no spaces.";
  } else if (
    trimmedUsername.length < USERNAME_MIN_LENGTH ||
    trimmedUsername.length > USERNAME_MAX_LENGTH
  ) {
    errors.username = `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters.`;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (password === "") {
    errors.password = "Enter a password.";
  } else if (!hasOnlyAllowedCharacters(password)) {
    errors.password = "Use only Latin letters (A–Z), numbers and symbols, with no spaces.";
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  } else if (getPasswordStrength(password) < PASSWORD_RULE_COUNT) {
    errors.password = `Your password must meet all ${PASSWORD_RULE_COUNT} rules below.`;
  }

  if (repeatPassword === "") {
    errors.repeatPassword = "Repeat your password.";
  } else if (repeatPassword !== password) {
    errors.repeatPassword = "Passwords don't match.";
  }

  return errors;
}

const WEAK_PASSWORD_REASONS = {
  length: "It is too short.",
  characters: "It needs an uppercase letter, a lowercase letter, a number and a special character.",
  pwned: "It has appeared in a known data leak, so it isn't safe to use.",
};

function getWeakPasswordMessage(reasons) {
  const explanations = Array.isArray(reasons)
    ? reasons.map((reason) => WEAK_PASSWORD_REASONS[reason]).filter(Boolean)
    : [];

  return ["Please choose a stronger password.", ...explanations].join(" ");
}

export function getAuthErrorMessage(error) {
  if (!error) {
    return getErrorMessage(error);
  }

  const { code, status } = error;
  const message = String(error.message ?? "");

  // Checked first: Supabase reports every HTTP 500 as a retryable fetch error ("Can't reach the
  // server"), but this one usually means the username was taken a moment ago.
  if (message.includes("Database error saving new user")) {
    return "That username is no longer available. Please choose another.";
  }

  if (code === "invalid_credentials" || message.includes("Invalid login credentials")) {
    return "Wrong email or password.";
  }

  if (code === "user_already_exists" || message.includes("User already registered")) {
    return EMAIL_TAKEN_MESSAGE;
  }

  if (code === "weak_password") {
    return getWeakPasswordMessage(error.reasons);
  }

  // Only a fallback: validateRegister already checks the 72-byte limit
  if (code === "validation_failed" && /password/i.test(message)) {
    return `Your password is too long. Please use at most ${PASSWORD_MAX_LENGTH} characters.`;
  }

  // Supabase checks email addresses more strictly than the form (e.g. "name@mail..com")
  if (code === "email_address_invalid" || (code === "validation_failed" && /email/i.test(message))) {
    return "This email address isn't valid. Please check it for typos.";
  }

  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  return getErrorMessage(error);
}

export function getAuthErrorField(error) {
  const code = error?.code;
  const message = String(error?.message ?? "");

  if (message.includes("Database error saving new user")) {
    return "username";
  }

  if (
    code === "invalid_credentials" ||
    code === "weak_password" ||
    (code === "validation_failed" && /password/i.test(message))
  ) {
    return "password";
  }

  if (
    code === "user_already_exists" ||
    message.includes("User already registered") ||
    code === "email_address_invalid" ||
    (code === "validation_failed" && /email/i.test(message))
  ) {
    return "email";
  }

  return "";
}
