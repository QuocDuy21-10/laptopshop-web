const KEY = "recent-searches";
const MAX = 5;

// localStorage can throw or be absent (private windows, blocked site data): history is a convenience only
function write(items: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  return items;
}

export function readSearches(): string[] {
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

/** Newest first, case-insensitive de-duplication, capped at five. */
export function addSearch(term: string): string[] {
  const value = term.trim();
  if (!value) return readSearches();
  const rest = readSearches().filter((x) => x.toLowerCase() !== value.toLowerCase());
  return write([value, ...rest].slice(0, MAX));
}

export const removeSearch = (term: string) => write(readSearches().filter((x) => x !== term));

export const clearSearches = () => write([]);
