const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same shape as the database check (^https?://\S+$), plus a real URL parse.
const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;

export function isEmail(value) {
  return EMAIL_PATTERN.test(value);
}

export function isHttpUrl(value) {
  if (!HTTP_URL_PATTERN.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
