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
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const parse = (value: string | null): PendingWishlistIntent | null => {
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
      !Number.isFinite(parsed.expiresAt)
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
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...input, version: 1, expiresAt: now + TTL_MS }));
};

export const readPendingWishlistIntent = (now = Date.now()): PendingWishlistIntent | null => {
  const parsed = parse(window.sessionStorage.getItem(STORAGE_KEY));
  if (!parsed || parsed.expiresAt <= now) {
    clearPendingWishlistIntent();
    return null;
  }
  return parsed;
};

export const clearPendingWishlistIntent = () => window.sessionStorage.removeItem(STORAGE_KEY);
