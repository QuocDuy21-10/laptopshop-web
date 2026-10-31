import { beforeEach, expect, it, vi } from "vitest";
import {
  createPendingImageSync,
  readPendingImageSyncFor,
  savePendingImageSyncFor,
  clearPendingImageSyncFor,
} from "@/features/reviews/pending-image-sync";
const scope = { userId: 7, productId: 12, reviewId: 18 };
beforeEach(() => sessionStorage.clear());
it("retains expired legacy metadata until explicit clear of the matching operation", () => {
  sessionStorage.setItem(
    "laptopshop:review-image-sync",
    JSON.stringify({
      productId: 12,
      reviewId: 18,
      expectedVersion: 1,
      idempotencyKey: "old",
      createdAt: 1,
      items: [],
    }),
  );
  expect(readPendingImageSyncFor({ ...scope, productId: 13 }).kind).toBe("none");
  expect(readPendingImageSyncFor(scope)).toMatchObject({
    kind: "legacy",
    value: { idempotencyKey: "old" },
  });
  clearPendingImageSyncFor(scope, "other");
  expect(readPendingImageSyncFor(scope).kind).toBe("legacy");
  clearPendingImageSyncFor(scope, "old");
  expect(readPendingImageSyncFor(scope).kind).toBe("none");
});
it("rejects duplicated clients in stored metadata without deleting evidence", async () => {
  const pending = await createPendingImageSync(scope, 1, "key", []);
  savePendingImageSyncFor(pending);
  const key = sessionStorage.key(0)!;
  sessionStorage.setItem(
    key,
    JSON.stringify({
      ...pending,
      items: [
        { kind: "existing", clientId: "same", imageId: 21 },
        { kind: "existing", clientId: "same", imageId: 22 },
      ],
    }),
  );
  expect(readPendingImageSyncFor(scope).kind).toBe("invalid");
  expect(sessionStorage.getItem(key)).not.toBeNull();
});
it("reports a storage write failure rather than silently skipping persistence", async () => {
  const pending = await createPendingImageSync(scope, 1, "key", []);
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
  try {
    expect(() => savePendingImageSyncFor(pending)).toThrow(/Không thể lưu trạng thái ảnh/);
  } finally {
    write.mockRestore();
  }
});
