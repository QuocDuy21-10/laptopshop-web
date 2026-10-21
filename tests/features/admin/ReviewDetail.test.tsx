import { screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { ReviewDetail } from "@/features/admin/reviews/ReviewDetail";
import { json, mockFetch, renderAdmin } from "../../utils";

const detail = {
  id: 18, rating: 5, title: "Ổn định", content: "Nội dung", isAnonymous: true, status: "HIDDEN", deletedAt: null,
  createdAt: "2026-10-21T03:00:00.000Z", contentUpdatedAt: "2026-10-21T04:00:00.000Z", hiddenReason: "Cần xem lại", moderatedAt: "2026-10-21T03:30:00.000Z",
  author: { id: 1, username: "buyer@test.local", fullName: "Nguyễn Văn A" }, product: { id: 12, name: "Asus Zenbook" },
  purchase: { orderId: 45, orderDetailId: 91, status: "COMPLETED", paymentStatus: "PAYMENT_SUCCESS", completedAt: "2026-10-20T03:00:00.000Z" }, moderatedBy: null,
};

describe("ReviewDetail", () => {
  beforeEach(() => mockFetch());

  it("shows evidence, edited-after-moderation warning and order link", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: detail }));
    renderAdmin(<ReviewDetail id={18} />);
    expect(await screen.findByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText(/đã sửa sau khi review bị ẩn/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Đơn #45/ })).toHaveAttribute("href", "/admin/orders/45");
  });

  it("does not offer moderation actions for deleted reviews", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { ...detail, deletedAt: "2026-10-22T03:00:00.000Z" } }));
    renderAdmin(<ReviewDetail id={18} />);
    await screen.findByText("Nguyễn Văn A");
    expect(screen.queryByRole("button", { name: /khôi phục|ẩn/i })).not.toBeInTheDocument();
  });
});
