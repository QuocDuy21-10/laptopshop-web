import { readPendingImageSyncFor } from "@/features/reviews/pending-image-sync";
import { File as NodeFile } from "node:buffer";
import { webcrypto } from "node:crypto";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { OwnerReview } from "@/lib/api/types";
import { ReviewDialog } from "@/features/reviews/ReviewDialog/ReviewDialog";
import { renderWithQuery } from "../../utils";

vi.mock("@/features/reviews/useBoundedReviewImageSyncStatus", () => ({
  useBoundedReviewImageSyncStatus: () => ({
    data: undefined,
    isError: false,
    timedOut: false,
    checkAgain: vi.fn(),
  }),
}));
const mutations = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), sync: vi.fn() }));
vi.mock("@/features/account/useMe", () => ({
  useMe: () => ({ data: { id: 7, fullName: "Nguyễn Văn A" } }),
}));
vi.mock("@/features/reviews/hooks", () => ({
  useCreateReview: () => ({ mutateAsync: mutations.create }),
  useUpdateReview: () => ({ mutateAsync: mutations.update }),
  useDeleteReview: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSyncReviewImages: () => ({ mutateAsync: mutations.sync }),
  useReviewImageSyncStatus: () => ({ data: undefined, isError: false }),
}));

const ownerReview: OwnerReview = {
  id: 18,
  productId: 12,
  rating: 5,
  title: null,
  content: "Nội dung mới đủ dài.",
  isAnonymous: false,
  status: "PUBLISHED",
  deletedAt: null,
  imageVersion: 7,
  verifiedPurchase: true,
  images: [],
  createdAt: "2026-10-21T00:00:00Z",
  updatedAt: "2026-10-21T00:00:00Z",
};

beforeEach(() => {
  vi.stubGlobal("File", NodeFile);
  vi.stubGlobal("crypto", webcrypto);
  sessionStorage.clear();
  for (const mutation of Object.values(mutations)) mutation.mockReset();
  window.sessionStorage.clear();
});

describe("ReviewDialog with the real review form", () => {
  it.each([0, 7])(
    "creates a review and syncs its selected file with saved version %i",
    async (imageVersion) => {
      mutations.create.mockResolvedValue({ data: { ...ownerReview, imageVersion } });
      mutations.sync.mockResolvedValue({
        reviewId: 18,
        imageVersion: imageVersion + 1,
        replayed: false,
        images: [],
      });
      const onOpenChange = vi.fn();
      renderWithQuery(
        <ReviewDialog
          productId={12}
          productName="Asus"
          eligibility={{
            eligible: true,
            reason: null,
            existingReview: null,
            willRequireModeration: false,
          }}
          open
          onOpenChange={onOpenChange}
        />,
      );
      const file = new File(["image"], "laptop.png", { type: "image/png" });

      await userEvent.click(screen.getByRole("radio", { name: "5 sao" }));
      await userEvent.click(screen.getByRole("radio", { name: "Công khai tên" }));
      await userEvent.type(
        screen.getByRole("textbox", { name: "Nội dung" }),
        "Nội dung mới đủ dài.",
      );
      await userEvent.upload(screen.getByLabelText("Chọn ảnh"), file);
      await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
      expect(mutations.create).toHaveBeenCalledWith({
        rating: 5,
        title: "",
        content: "Nội dung mới đủ dài.",
        isAnonymous: false,
      });
      expect(mutations.sync).toHaveBeenCalledWith({
        reviewId: 18,
        expectedVersion: imageVersion,
        idempotencyKey: expect.any(String),
        items: [expect.objectContaining({ kind: "new", file })],
      });
      expect(readPendingImageSyncFor({ userId: 7, productId: 12, reviewId: 18 }).kind).toBe("none");
    },
  );

  it("edits a review and syncs with the fresh update version", async () => {
    mutations.update.mockResolvedValue({ data: ownerReview });
    mutations.sync.mockResolvedValue({
      reviewId: 18,
      imageVersion: 8,
      replayed: false,
      images: [],
    });
    const onOpenChange = vi.fn();
    renderWithQuery(
      <ReviewDialog
        productId={12}
        productName="Asus"
        eligibility={{
          eligible: false,
          reason: "ALREADY_REVIEWED",
          existingReview: { ...ownerReview, imageVersion: 3 },
          willRequireModeration: false,
        }}
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByRole("radio", { name: "Công khai tên" })).toBeChecked();
    await userEvent.upload(
      screen.getByLabelText("Chọn ảnh"),
      new File(["image"], "edited.png", { type: "image/png" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(mutations.update).toHaveBeenCalledWith({
      rating: 5,
      title: "",
      content: "Nội dung mới đủ dài.",
      isAnonymous: false,
    });
    expect(mutations.sync).toHaveBeenCalledWith(
      expect.objectContaining({ reviewId: 18, expectedVersion: 7 }),
    );
  });
});
