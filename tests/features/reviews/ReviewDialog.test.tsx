import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewDialog } from "@/features/reviews/ReviewDialog/ReviewDialog";
import { renderWithQuery } from "../../utils";

const mocks = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(), isPending: false },
  update: { mutateAsync: vi.fn(), isPending: false },
  remove: { mutateAsync: vi.fn(), isPending: false },
  addImages: { mutateAsync: vi.fn(), isPending: false },
  reorderImages: { mutateAsync: vi.fn(), isPending: false },
  deleteImage: { mutateAsync: vi.fn(), isPending: false },
}));

vi.mock("@/features/account/useMe", () => ({ useMe: () => ({ data: { id: 7, fullName: "Nguyễn Văn A" } }) }));
vi.mock("@/features/reviews/hooks", () => ({
  useCreateReview: () => mocks.create,
  useUpdateReview: () => mocks.update,
  useDeleteReview: () => mocks.remove,
  useAddReviewImages: () => mocks.addImages,
  useReorderReviewImages: () => mocks.reorderImages,
  useDeleteReviewImage: () => mocks.deleteImage,
}));
vi.mock("@/features/reviews/ReviewForm/ReviewForm", () => ({
  ReviewForm: ({ onSubmit, onImagesChange, imageError }: { onSubmit: (input: unknown) => Promise<void>; onImagesChange: (state: unknown) => void; imageError?: string | null }) => (
    <>
      {imageError && <p>{imageError}</p>}
      <button type="button" onClick={() => onImagesChange({ existingIds: [], newFiles: [new File(["x"], "laptop.png", { type: "image/png" })] })}>Add image</button>
      <button type="button" onClick={() => void onSubmit({ rating: 5, content: "Nội dung đủ dài.", isAnonymous: true })}>Gửi đánh giá</button>
    </>
  ),
}));

const eligibility = { eligible: true, reason: null, existingReview: null, willRequireModeration: false } as const;

beforeEach(() => {
  for (const mutation of Object.values(mocks)) mutation.mutateAsync.mockReset();
  mocks.create.mutateAsync.mockResolvedValue({ data: { id: 18, productId: 12, rating: 5, title: null, content: "Nội dung đủ dài.", isAnonymous: true, status: "PUBLISHED", deletedAt: null, verifiedPurchase: true, images: [], createdAt: "2026-10-21T00:00:00Z", updatedAt: "2026-10-21T00:00:00Z" } });
  mocks.addImages.mutateAsync.mockRejectedValue(new Error("storage down"));
  mocks.reorderImages.mutateAsync.mockResolvedValue({ data: [] });
});

describe("ReviewDialog image partial success", () => {
  it("keeps the saved review open and offers retry messaging when image upload fails", async () => {
    renderWithQuery(<ReviewDialog productId={12} productName="Asus" eligibility={eligibility} open onOpenChange={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Add image" }));
    await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    await waitFor(() => expect(mocks.create.mutateAsync).toHaveBeenCalled());
    expect(await screen.findByText("Đánh giá đã được lưu nhưng ảnh chưa tải lên")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeInTheDocument();
  });
});
