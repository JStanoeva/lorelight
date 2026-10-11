const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";
const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

// Postgres and PostgREST error codes returned by Supabase.
const MESSAGES_BY_CODE = {
  PGRST116: "We couldn't find that.",
  "22P02": "We couldn't find that.",
  "42501": "You don't have permission to do that.",
  "23514": "Some values aren't valid. Please check the form.",
  "23505": "That already exists.",
};

// Browsers word failed requests differently (Chrome, Firefox, Safari).
const NETWORK_ERROR_TEXTS = ["Failed to fetch", "NetworkError", "Load failed"];

function isNetworkError(error) {
  if (error.name === "TypeError" || error.name === "AuthRetryableFetchError") {
    return true;
  }

  const message = String(error.message ?? "");
  return NETWORK_ERROR_TEXTS.some((text) => message.includes(text));
}

export function getErrorMessage(error) {
  if (!error) {
    return FALLBACK_MESSAGE;
  }

  if (isNetworkError(error)) {
    return NETWORK_MESSAGE;
  }

  return MESSAGES_BY_CODE[error.code] ?? FALLBACK_MESSAGE;
}
