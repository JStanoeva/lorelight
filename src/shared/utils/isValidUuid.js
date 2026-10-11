const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Ids from the URL are checked before querying: Postgres rejects malformed UUIDs with an error.
export function isValidUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
