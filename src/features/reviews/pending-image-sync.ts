import { z } from "zod";
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
    if (value.productId !== productId || value.reviewId !== reviewId) {
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
        : {
            kind: "new",
            clientId: item.clientId,
            fileName: item.file.name,
            fileSize: item.file.size,
            fileType: item.file.type,
          },
    ),
  };
}

export type PendingSyncScope = { userId: number; productId: number; reviewId: number };
export type PendingNewItem = {
  kind: "new";
  clientId: string;
  fileIndex: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  sha256: string;
};
export type PendingImageSyncV2 = PendingSyncScope & {
  schemaVersion: 2;
  expectedVersion: number;
  idempotencyKey: string;
  createdAt: number;
  items: Array<PendingNewItem | { kind: "existing"; clientId: string; imageId: number }>;
};
export type LegacyPendingImageSync = PendingImageSync;
export type RecoverableImageSync = PendingImageSyncV2 | LegacyPendingImageSync;
export type PendingReadResult =
  | { kind: "none" }
  | { kind: "current"; value: PendingImageSyncV2 }
  | { kind: "legacy"; value: LegacyPendingImageSync }
  | { kind: "invalid" | "storage-error"; reason: string };
export class PendingImageSyncStorageError extends Error {
  constructor() {
    super(
      "Không thể lưu trạng thái ảnh trong trình duyệt. Hãy kiểm tra quyền lưu trữ trước khi gửi ảnh.",
    );
  }
}
const prefixFor = (scope: PendingSyncScope) =>
  `${STORAGE_KEY}:v2:${scope.userId}:${scope.productId}:${scope.reviewId}:`;
const recordKey = (value: PendingImageSyncV2) =>
  `${prefixFor(value)}${encodeURIComponent(value.idempotencyKey)}`;

export async function hashReviewImageFile(file: File): Promise<string> {
  if (!globalThis.crypto?.subtle)
    throw new Error(
      "Trình duyệt chưa hỗ trợ xác minh ảnh gốc. Hãy dùng kết nối bảo mật và thử lại.",
    );
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function createPendingImageSync(
  scope: PendingSyncScope,
  expectedVersion: number,
  key: string,
  items: readonly DraftImage[],
): Promise<PendingImageSyncV2> {
  let fileIndex = 0;
  const indexed = items.map((item) => ({
    item,
    fileIndex: item.kind === "new" ? fileIndex++ : -1,
  }));
  return {
    ...scope,
    schemaVersion: 2,
    expectedVersion,
    idempotencyKey: key,
    createdAt: Date.now(),
    items: await Promise.all(
      indexed.map(async ({ item, fileIndex }) =>
        item.kind === "existing"
          ? { kind: "existing" as const, clientId: item.clientId, imageId: item.image.id }
          : {
              kind: "new" as const,
              clientId: item.clientId,
              fileIndex,
              fileName: item.file.name,
              fileSize: item.file.size,
              fileType: item.file.type,
              sha256: await hashReviewImageFile(item.file),
            },
      ),
    ),
  };
}
export function savePendingImageSyncFor(value: PendingImageSyncV2): void {
  try {
    window.sessionStorage.setItem(recordKey(value), JSON.stringify(value));
  } catch {
    throw new PendingImageSyncStorageError();
  }
}
export function readPendingImageSyncFor(scope: PendingSyncScope): PendingReadResult {
  if (typeof window === "undefined") return { kind: "none" };
  try {
    const keys = Array.from({ length: sessionStorage.length }, (_, index) =>
      sessionStorage.key(index),
    ).filter((key): key is string => Boolean(key?.startsWith(prefixFor(scope))));
    if (keys.length > 1)
      return {
        kind: "invalid",
        reason: "Có nhiều thao tác ảnh chưa được đối soát. Hãy kiểm tra lại trạng thái.",
      };
    if (keys.length) {
      const parsed = currentSchema.safeParse(JSON.parse(sessionStorage.getItem(keys[0]) ?? "null"));
      if (
        !parsed.success ||
        parsed.data.userId !== scope.userId ||
        parsed.data.productId !== scope.productId ||
        parsed.data.reviewId !== scope.reviewId ||
        recordKey(parsed.data) !== keys[0]
      )
        return {
          kind: "invalid",
          reason: "Trạng thái ảnh đã lưu không hợp lệ. Hãy kiểm tra lại dữ liệu.",
        };
      return { kind: "current", value: parsed.data };
    }
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { kind: "none" };
    const parsed = legacySchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return {
        kind: "invalid",
        reason: "Trạng thái ảnh đã lưu không hợp lệ. Hãy kiểm tra lại dữ liệu.",
      };
    return parsed.data.productId === scope.productId && parsed.data.reviewId === scope.reviewId
      ? { kind: "legacy", value: parsed.data }
      : { kind: "none" };
  } catch (error) {
    return error instanceof SyntaxError
      ? { kind: "invalid", reason: "Không đọc được trạng thái ảnh đã lưu." }
      : { kind: "storage-error", reason: new PendingImageSyncStorageError().message };
  }
}
export function clearPendingImageSyncFor(scope: PendingSyncScope, key: string): void {
  try {
    sessionStorage.removeItem(`${prefixFor(scope)}${encodeURIComponent(key)}`);
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const legacy = legacySchema.safeParse(JSON.parse(raw));
      if (
        legacy.success &&
        legacy.data.productId === scope.productId &&
        legacy.data.reviewId === scope.reviewId &&
        legacy.data.idempotencyKey === key
      )
        sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    throw new PendingImageSyncStorageError();
  }
}

const existingItem = z.object({
  kind: z.literal("existing"),
  clientId: z.string().min(1).max(64),
  imageId: z.number().int().positive(),
});
const legacyNew = z.object({
  kind: z.literal("new"),
  clientId: z.string().min(1).max(64),
  fileName: z.string(),
  fileSize: z.number().int().min(0).max(3_145_728),
  fileType: z.enum(["image/png", "image/jpeg", "image/webp"]),
});
const legacySchema = z
  .object({
    productId: z.number().int().positive(),
    reviewId: z.number().int().positive(),
    expectedVersion: z.number().int().nonnegative(),
    idempotencyKey: z.string().min(1).max(64),
    createdAt: z.number().nonnegative(),
    items: z.array(z.discriminatedUnion("kind", [existingItem, legacyNew])).max(3),
  })
  .refine((value) => new Set(value.items.map((item) => item.clientId)).size === value.items.length);
const currentSchema = z
  .object({
    schemaVersion: z.literal(2),
    userId: z.number().int().positive(),
    productId: z.number().int().positive(),
    reviewId: z.number().int().positive(),
    expectedVersion: z.number().int().nonnegative(),
    idempotencyKey: z.string().min(1).max(64),
    createdAt: z.number().nonnegative(),
    items: z
      .array(
        z.discriminatedUnion("kind", [
          existingItem,
          legacyNew.extend({
            fileIndex: z.number().int().nonnegative(),
            sha256: z.string().regex(/^[a-f0-9]{64}$/),
          }),
        ]),
      )
      .max(3),
  })
  .refine((value) => {
    const clients = value.items.map((item) => item.clientId);
    const images = value.items.flatMap((item) => (item.kind === "existing" ? [item.imageId] : []));
    const files = value.items.flatMap((item) => (item.kind === "new" ? [item.fileIndex] : []));
    return (
      new Set(clients).size === clients.length &&
      new Set(images).size === images.length &&
      files.every((index, position) => index === position)
    );
  });
