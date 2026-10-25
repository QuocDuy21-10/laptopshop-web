import { safeNext } from "@/lib/safe-next";

export type PendingWishlistIntent = {
  version: 1;
  action: "ADD_WISHLIST";
  productId: number;
  returnTo: string;
  expiresAt: number;
};

const STORAGE_KEY = "laptopshop.wishlist.intent";
const TTL_MS = 10 * 60 * 1000;

const isSafeReturnTo = (value: unknown): value is string =>
  typeof value === "string" && safeNext(value) === value;

const storage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const parse = (value: string | null, now = Date.now()): PendingWishlistIntent | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<PendingWishlistIntent>;
    if (
      parsed.version !== 1 ||
      parsed.action !== "ADD_WISHLIST" ||
      typeof parsed.productId !== "number" ||
      !Number.isInteger(parsed.productId) ||
      parsed.productId <= 0 ||
      !isSafeReturnTo(parsed.returnTo) ||
      typeof parsed.expiresAt !== "number" ||
      !Number.isFinite(parsed.expiresAt) ||
      parsed.expiresAt > now + TTL_MS
    ) return null;
    return parsed as PendingWishlistIntent;
  } catch {
    return null;
  }
};

export const savePendingWishlistIntent = (
  input: Omit<PendingWishlistIntent, "version" | "expiresAt">,
  now = Date.now(),
) => {
  if (input.action !== "ADD_WISHLIST" || !Number.isInteger(input.productId) || input.productId <= 0 || !isSafeReturnTo(input.returnTo)) {
    clearPendingWishlistIntent();
    return false;
  }
  try {
    const target = storage();
    if (!target) return false;
    target.setItem(STORAGE_KEY, JSON.stringify({ ...input, version: 1, expiresAt: now + TTL_MS }));
    return true;
  } catch {
    return false;
  }
};

export const readPendingWishlistIntent = (now = Date.now()): PendingWishlistIntent | null => {
  let raw: string | null = null;
  try {
    raw = storage()?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
  const parsed = parse(raw, now);
  if (!parsed || parsed.expiresAt <= now) {
    clearPendingWishlistIntent();
    return null;
  }
  return parsed;
};

export const clearPendingWishlistIntent = () => {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
};
