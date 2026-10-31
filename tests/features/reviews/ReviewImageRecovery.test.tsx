import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewImageRecovery } from "@/features/reviews/ReviewImageRecovery/ReviewImageRecovery";
import type { PendingImageSyncV2 } from "@/features/reviews/pending-image-sync";
import { renderWithQuery } from "../../utils";

it("selects repeated filenames by original client instead of array replacement", async () => {
  const pending: PendingImageSyncV2 = {
    schemaVersion: 2,
    userId: 7,
    productId: 12,
    reviewId: 18,
    expectedVersion: 7,
    idempotencyKey: "key",
    createdAt: 1,
    items: ["first", "second"].map((clientId, fileIndex) => ({
      kind: "new",
      clientId,
      fileIndex,
      fileName: "one.png",
      fileType: "image/png",
      fileSize: 3,
      sha256: "a".repeat(64),
    })),
  };
  const onReselect = vi.fn();
  renderWithQuery(
    <ReviewImageRecovery
      pending={pending}
      filesByClientId={new Map()}
      invalidClientIds={[]}
      onReselect={onReselect}
    />,
  );
  const file = new File(["abc"], "one.png", { type: "image/png" });
  await userEvent.upload(screen.getByLabelText("Chọn lại ảnh 2: one.png"), file);
  expect(onReselect).toHaveBeenCalledExactlyOnceWith("second", file);
  expect(screen.getByRole("status")).toHaveTextContent("Còn thiếu 2/2 ảnh gốc");
});
