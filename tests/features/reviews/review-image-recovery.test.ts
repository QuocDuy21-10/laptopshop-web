import { File as NodeFile } from "node:buffer";
import { webcrypto } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPendingImageSync,
  savePendingImageSyncFor,
  readPendingImageSyncFor,
  clearPendingImageSyncFor,
} from "@/features/reviews/pending-image-sync";
import { verifyRecoveryFile, rebuildRecoveryDraft } from "@/features/reviews/review-image-recovery";

const scope = { userId: 7, productId: 12, reviewId: 18 };
const draft = (file: File, clientId = "new-1") => ({
  kind: "new" as const,
  clientId,
  file,
  url: "blob:test",
});
beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal("File", NodeFile);
  vi.stubGlobal("crypto", webcrypto);
});

describe("original review image recovery", () => {
  it("rejects different bytes with the same filename, MIME and size", async () => {
    const original = new File(["abc"], "one.png", { type: "image/png" });
    const pending = await createPendingImageSync(scope, 7, "original-key", [draft(original)]);
    const item = pending.items[0];
    if (item.kind !== "new") throw new Error("fixture");
    expect(
      await verifyRecoveryFile(item, new File(["xyz"], "one.png", { type: "image/png" })),
    ).toBe(false);
    expect(await verifyRecoveryFile(item, original)).toBe(true);
    expect(item.sha256).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(JSON.stringify(pending)).not.toContain("blob:");
    expect(JSON.stringify(pending)).not.toContain("abc");
  });
  it("keeps pending records across account/product reads and only clears the matching key", async () => {
    const pending = await createPendingImageSync(scope, 7, "original-key", []);
    savePendingImageSyncFor(pending);
    expect(readPendingImageSyncFor({ ...scope, userId: 8 }).kind).toBe("none");
    expect(readPendingImageSyncFor({ ...scope, productId: 13 }).kind).toBe("none");
    clearPendingImageSyncFor(scope, "other-key");
    expect(readPendingImageSyncFor(scope)).toMatchObject({
      kind: "current",
      value: { idempotencyKey: "original-key" },
    });
    clearPendingImageSyncFor(scope, "original-key");
    expect(readPendingImageSyncFor(scope).kind).toBe("none");
  });
  it("rebuilds in manifest order and assigns identical files to their original clients", async () => {
    const file = new File(["abc"], "one.png", { type: "image/png" });
    const pending = await createPendingImageSync(scope, 7, "key", [
      draft(file, "first"),
      draft(file, "second"),
    ]);
    const missing = await rebuildRecoveryDraft(pending, new Map([["second", file]]), [], false);
    expect(missing).toMatchObject({ ready: false, missingClientIds: ["first"] });
    const result = await rebuildRecoveryDraft(
      pending,
      new Map([
        ["second", file],
        ["first", file],
      ]),
      [],
      false,
    );
    expect(result).toMatchObject({
      ready: true,
      items: [
        { clientId: "first", file },
        { clientId: "second", file },
      ],
    });
    expect(pending.expectedVersion).toBe(7);
  });
  it("retains expired legacy metadata until server reconciliation and requires confirmation to retry", async () => {
    const legacy = {
      productId: 12,
      reviewId: 18,
      expectedVersion: 0,
      idempotencyKey: "legacy",
      createdAt: 1,
      items: [
        { kind: "new", clientId: "old", fileName: "one.png", fileSize: 3, fileType: "image/png" },
      ],
    };
    sessionStorage.setItem("laptopshop:review-image-sync", JSON.stringify(legacy));
    const read = readPendingImageSyncFor(scope);
    expect(read.kind).toBe("legacy");
    if (read.kind !== "legacy") throw new Error("fixture");
    const files = new Map([["old", new File(["abc"], "one.png", { type: "image/png" })]]);
    expect(await rebuildRecoveryDraft(read.value, files, [], false)).toMatchObject({
      ready: false,
    });
    expect(await rebuildRecoveryDraft(read.value, files, [], true)).toMatchObject({ ready: true });
    expect(sessionStorage.getItem("laptopshop:review-image-sync")).not.toBeNull();
  });
  it("reports invalid JSON and storage failure without claiming that pending completed", () => {
    sessionStorage.setItem("laptopshop:review-image-sync", "{");
    expect(readPendingImageSyncFor(scope).kind).toBe("invalid");
    vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
      throw new Error("denied");
    });
    expect(readPendingImageSyncFor(scope).kind).toBe("storage-error");
    vi.restoreAllMocks();
  });
});
