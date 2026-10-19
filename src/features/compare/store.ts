export type CompareItem = { id: number; name: string; image: string | null };

export const MAX_COMPARE = 4;
export const EMPTY_COMPARE: CompareItem[] = [];

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
    cachedItems =
      Array.isArray(parsed) && parsed.every(isItem) ? parsed.slice(0, MAX_COMPARE) : EMPTY_COMPARE;
  } catch {
    cachedItems = EMPTY_COMPARE;
  }
  return cachedItems;
}

function write(items: CompareItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    return;
  }
  listeners.forEach((l) => l());
}

export function toggleCompare(item: CompareItem): "added" | "removed" | "full" {
  const items = getCompareItems();
  if (items.some((i) => i.id === item.id)) {
    write(items.filter((i) => i.id !== item.id));
    return "removed";
  }
  if (items.length >= MAX_COMPARE) return "full";
  write([...items, { id: item.id, name: item.name, image: item.image }]);
  return "added";
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
