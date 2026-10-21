import { screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { ReviewList } from "@/features/admin/reviews/ReviewList";
import { json, mockFetch, renderAdmin, urlOf } from "../../utils";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/reviews",
  useRouter: () => ({ push: vi.fn() }),
}));

const row = {
  id: 18, rating: 5, title: "Ổn định", content: "Nội dung", isAnonymous: true, status: "HIDDEN", deletedAt: null,
  createdAt: "2026-10-21T03:00:00.000Z", contentUpdatedAt: "2026-10-21T04:00:00.000Z", hiddenReason: "Cần xem lại", moderatedAt: "2026-10-21T03:30:00.000Z",
  author: { id: 1, username: "buyer@test.local", fullName: "Nguyễn Văn A" }, product: { id: 12, name: "Asus Zenbook" },
  purchase: { orderId: 45, orderDetailId: 91, status: "COMPLETED", paymentStatus: "PAYMENT_SUCCESS", completedAt: "2026-10-20T03:00:00.000Z" }, moderatedBy: null,
};

describe("ReviewList", () => {
  beforeEach(() => mockFetch());

  it("shows KPI, filters and the real author for anonymous reviews", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockImplementation(async (input) => urlOf(input).includes("summary")
      ? json(200, { data: { totalReviews: 5, publishedReviews: 3, hiddenReviews: 2, deletedReviews: 1, averageRating: 4.7 } })
      : json(200, { data: [row], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } }));
    renderAdmin(<ReviewList />);
    expect(await screen.findByText("Đánh giá")).toBeInTheDocument();
    expect(await screen.findByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("Ẩn danh")).toBeInTheDocument();
    expect(screen.getByText("Rating trung bình").parentElement?.parentElement).toHaveTextContent("4.7");
  });
});
