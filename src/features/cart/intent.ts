const STORAGE_KEY = "laptopshop.cart.intent";
const TTL_MS = 10 * 60 * 1000;

export type PendingCartIntent = { productId: number; quantity: number; goToCart: boolean; expiresAt: number };

const storage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

export const savePendingCartIntent = (
  input: Omit<PendingCartIntent, "expiresAt">,
  now = Date.now(),
) => {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify({ ...input, expiresAt: now + TTL_MS }));
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
};

export const clearPendingCartIntent = () => {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // see above
  }
};

export const readPendingCartIntent = (now = Date.now()): PendingCartIntent | null => {
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<PendingCartIntent>;
    if (
      !Number.isInteger(v.productId) || v.productId! <= 0 ||
      !Number.isInteger(v.quantity) || v.quantity! <= 0 ||
      typeof v.goToCart !== "boolean" ||
      typeof v.expiresAt !== "number" || v.expiresAt <= now || v.expiresAt > now + TTL_MS
    ) {
      clearPendingCartIntent();
      return null;
    }
    return v as PendingCartIntent;
  } catch {
    clearPendingCartIntent();
    return null;
  }
};
