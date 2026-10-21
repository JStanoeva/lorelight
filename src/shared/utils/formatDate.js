const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthYearFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

// en-US, because en-GB shortens September to "Sept"
const shortMonthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

function format(formatter, value) {
  // new Date(null) would silently become 1 January 1970.
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : formatter.format(date);
}

// "2026-10-11T09:30:00Z" → "11 Oct 2026"
export function formatDate(value) {
  return format(dateFormatter, value);
}

// "2026-10-11T09:30:00Z" → "October 2026" (e.g. "Member since October 2026")
export function formatMonthYear(value) {
  return format(monthYearFormatter, value);
}

// "2026-09-14T09:30:00Z" → "Sep 2026" (e.g. "Member since Sep 2026")
export function formatShortMonthYear(value) {
  return format(shortMonthYearFormatter, value);
}
