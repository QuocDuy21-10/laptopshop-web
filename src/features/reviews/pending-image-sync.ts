import type { DraftImage } from "./ReviewImagesEditor/ReviewImagesEditor";

const STORAGE_KEY = "laptopshop:review-image-sync";

export type PendingImageSync = {
  productId: number;
  reviewId: number;
  expectedVersion: number;
  idempotencyKey: string;
  createdAt: number;
  items: Array<
    | { kind: "existing"; clientId: string; imageId: number }
    | { kind: "new"; clientId: string; fileName: string; fileSize: number; fileType: string }
  >;
};

export function savePendingImageSync(value: PendingImageSync) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function readPendingImageSync(productId: number, reviewId: number): PendingImageSync | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as PendingImageSync;
    if (value.productId !== productId || value.reviewId !== reviewId || value.createdAt < Date.now() - 24 * 60 * 60 * 1000) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearPendingImageSync() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEY);
}

export function toPendingImageSync(
  productId: number,
  reviewId: number,
  expectedVersion: number,
  idempotencyKey: string,
  items: readonly DraftImage[],
): PendingImageSync {
  return {
    productId,
    reviewId,
    expectedVersion,
    idempotencyKey,
    createdAt: Date.now(),
    items: items.map((item) =>
      item.kind === "existing"
        ? { kind: "existing", clientId: item.clientId, imageId: item.image.id }
        : { kind: "new", clientId: item.clientId, fileName: item.file.name, fileSize: item.file.size, fileType: item.file.type },
    ),
  };
}
