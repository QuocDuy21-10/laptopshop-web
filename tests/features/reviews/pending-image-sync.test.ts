import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPendingImageSync,
  readPendingImageSync,
  savePendingImageSync,
  toPendingImageSync,
} from "@/features/reviews/pending-image-sync";

beforeEach(() => sessionStorage.clear());

describe("pending image sync metadata", () => {
  it("stores manifest metadata without binary file contents", () => {
    const value = toPendingImageSync(12, 18, 2, "sync-key", [
      {
        kind: "new",
        clientId: "new-1",
        file: new File(["secret"], "one.png", { type: "image/png" }),
        url: "blob:one",
      },
    ]);
    savePendingImageSync(value);
    expect(readPendingImageSync(12, 18)).toEqual(
      expect.objectContaining({
        idempotencyKey: "sync-key",
        items: [
          {
            kind: "new",
            clientId: "new-1",
            fileName: "one.png",
            fileSize: 6,
            fileType: "image/png",
          },
        ],
      }),
    );
    expect(sessionStorage.getItem("laptopshop:review-image-sync")).not.toContain("secret");
  });

  it("retains expired unresolved metadata and supports explicit clear", () => {
    savePendingImageSync({
      productId: 12,
      reviewId: 18,
      expectedVersion: 1,
      idempotencyKey: "old",
      createdAt: Date.now() - 86_400_001,
      items: [],
    });
    expect(readPendingImageSync(12, 18)?.idempotencyKey).toBe("old");
    savePendingImageSync({
      productId: 12,
      reviewId: 18,
      expectedVersion: 1,
      idempotencyKey: "new",
      createdAt: Date.now(),
      items: [],
    });
    clearPendingImageSync();
    expect(sessionStorage.getItem("laptopshop:review-image-sync")).toBeNull();
  });
});

it("does not erase another product's unresolved operation during a read", () => {
  savePendingImageSync({
    productId: 12,
    reviewId: 18,
    expectedVersion: 1,
    idempotencyKey: "keep",
    createdAt: Date.now(),
    items: [],
  });
  expect(readPendingImageSync(13, 18)).toBeNull();
  expect(readPendingImageSync(12, 18)?.idempotencyKey).toBe("keep");
});
