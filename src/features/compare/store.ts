export type CompareItem = { id: number; name: string; image: string | null };

export const MAX_COMPARE = 4;
export const EMPTY_COMPARE: CompareItem[] = [];
// the API caps ids at 9 digits
const MAX_ID = 999_999_999;

const KEY = "laptopshop.compare";
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedItems: CompareItem[] = EMPTY_COMPARE;

const isItem = (v: unknown): v is CompareItem => {
  const i = v as CompareItem;
  return (
    typeof v === "object" &&
    v !== null &&
    Number.isInteger(i.id) &&
    i.id > 0 &&
    i.id <= MAX_ID &&
    typeof i.name === "string" &&
    (i.image === null || typeof i.image === "string")
  );
};

// storage can throw (private mode, blocked site data); the feature then behaves as empty
function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// useSyncExternalStore needs the same reference while the data is unchanged
export function getCompareItems(): CompareItem[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    // drop invalid and duplicate entries left by hand edits or older versions
    const valid = Array.isArray(parsed) ? parsed.filter(isItem) : [];
    const unique = valid.filter((item, i) => valid.findIndex((x) => x.id === item.id) === i);
    cachedItems = unique.length ? unique.slice(0, MAX_COMPARE) : EMPTY_COMPARE;
  } catch {
    cachedItems = EMPTY_COMPARE;
  }
  return cachedItems;
}

// false when the browser refuses to store (blocked site data, quota)
function write(items: CompareItem[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

export function toggleCompare(item: CompareItem): "added" | "removed" | "full" | "error" {
  const items = getCompareItems();
  if (items.some((i) => i.id === item.id)) {
    return write(items.filter((i) => i.id !== item.id)) ? "removed" : "error";
  }
  if (items.length >= MAX_COMPARE) return "full";
  return write([...items, { id: item.id, name: item.name, image: item.image }]) ? "added" : "error";
}

export const removeCompare = (ids: number[]) =>
  write(getCompareItems().filter((i) => !ids.includes(i.id)));

export const clearCompare = () => write([]);

export function subscribeCompare(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const compareHref = (ids: number[]) =>
  ids.length ? `/compare?ids=${ids.join(",")}` : "/compare";
