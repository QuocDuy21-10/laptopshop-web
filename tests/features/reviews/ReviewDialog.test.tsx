import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewDialog } from "@/features/reviews/ReviewDialog/ReviewDialog";
import { renderWithQuery } from "../../utils";

const mocks = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(), isPending: false },
  update: { mutateAsync: vi.fn(), isPending: false },
  remove: { mutateAsync: vi.fn(), isPending: false },
  sync: { mutateAsync: vi.fn(), isPending: false },
}));

vi.mock("@/features/account/useMe", () => ({ useMe: () => ({ data: { id: 7, fullName: "Nguyễn Văn A" } }) }));
vi.mock("@/features/reviews/hooks", () => ({
  useCreateReview: () => mocks.create,
  useUpdateReview: () => mocks.update,
  useDeleteReview: () => mocks.remove,
  useSyncReviewImages: () => mocks.sync,
  useReviewImageSyncStatus: () => ({ data: undefined, isError: false, refetch: vi.fn() }),
}));
vi.mock("@/features/reviews/ReviewForm/ReviewForm", () => ({
  ReviewForm: ({ onSubmit, onImagesChange, imageError }: { onSubmit: (input: unknown) => Promise<void>; onImagesChange: (state: unknown) => void; imageError?: string | null }) => (
    <>
      {imageError && <p>{imageError}</p>}
      <button type="button" onClick={() => onImagesChange([{ kind: "new", clientId: "new-image", file: new File(["x"], "laptop.png", { type: "image/png" }), url: "blob:laptop" }])}>Add image</button>
      <button type="button" onClick={() => void onSubmit({ rating: 5, content: "Nội dung đủ dài.", isAnonymous: true })}>Gửi đánh giá</button>
    </>
  ),
}));

const eligibility = { eligible: true, reason: null, existingReview: null, willRequireModeration: false } as const;

beforeEach(() => {
  for (const mutation of Object.values(mocks)) mutation.mutateAsync.mockReset();
  mocks.create.mutateAsync.mockResolvedValue({ data: { id: 18, productId: 12, rating: 5, title: null, content: "Nội dung đủ dài.", isAnonymous: true, status: "PUBLISHED", deletedAt: null, imageVersion: 0, verifiedPurchase: true, images: [], createdAt: "2026-10-21T00:00:00Z", updatedAt: "2026-10-21T00:00:00Z" } });
  mocks.sync.mutateAsync.mockRejectedValue(new Error("network"));
});

describe("ReviewDialog image sync workflow", () => {
  it("uses the saved review ID and keeps the dialog open after an unknown sync result", async () => {
    const onOpenChange = vi.fn();
    renderWithQuery(<ReviewDialog productId={12} productName="Asus" eligibility={eligibility} open onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Add image" }));
    await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    await waitFor(() => expect(mocks.sync.mutateAsync).toHaveBeenCalled());
    expect(mocks.sync.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ reviewId: 18, idempotencyKey: expect.any(String) }));
    expect(await screen.findByText(/đang kiểm tra trạng thái ảnh/i)).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
