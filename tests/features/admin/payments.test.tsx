import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { PaymentReviewCaseList } from "@/features/admin/payments/PaymentReviewCaseList";
import { json, mockFetch, renderAdmin, urlOf } from "../../utils";

const reviewCase = {
  id: "11111111-1111-4111-8111-111111111111",
  paymentId: "22222222-2222-4222-8222-222222222222",
  reason: "RECONCILIATION_INCONCLUSIVE",
  status: "OPEN",
  version: 0,
  openedAt: "2026-10-24T10:00:00.000Z",
  nextReviewAt: "2026-10-24T11:00:00.000Z",
  resolvedAt: null,
  resolution: null,
  payment: {
    id: "22222222-2222-4222-8222-222222222222",
    orderId: 50,
    status: "REVIEW_REQUIRED",
    amount: 1000,
    transferCode: "LSABC12345678",
    expiresAt: "2026-10-24T09:45:00.000Z",
    reviewAfter: "2026-10-24T10:45:00.000Z",
    order: { status: "PENDING", paymentMethod: "BANK_TRANSFER", paymentStatus: "PAYMENT_UNPAID" },
  },
};

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
});

describe("PaymentReviewCaseList", () => {
  it("lists open review cases and exposes audited actions", async () => {
    fetchMock.mockResolvedValue(json(200, { data: [reviewCase], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } }));
    renderAdmin(<PaymentReviewCaseList />);
    expect(await screen.findByText("RECONCILIATION_INCONCLUSIVE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gia hạn giữ hàng" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Giải phóng tồn kho" })).toBeInTheDocument();
  });

  it("keeps pagination available when the review queue has multiple pages", async () => {
    fetchMock.mockResolvedValue(json(200, { data: [reviewCase], meta: { page: 1, pageSize: 10, total: 25, totalPages: 3 } }));
    renderAdmin(<PaymentReviewCaseList />);
    await screen.findByText("RECONCILIATION_INCONCLUSIVE");
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByTitle("2")).toBeInTheDocument();
  });

  it("requires note and confirmation before releasing stock", async () => {
    fetchMock.mockResolvedValue(json(200, { data: [reviewCase], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } }));
    renderAdmin(<PaymentReviewCaseList />);
    await userEvent.click(await screen.findByRole("button", { name: "Giải phóng tồn kho" }));
    expect(screen.getByRole("button", { name: "Xác nhận giải phóng" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Huỷ" }));
    expect(fetchMock.mock.calls.some(([input]) => urlOf(input).includes("/release"))).toBe(false);
  });

  it("sends the version when extending a hold", async () => {
    fetchMock.mockImplementation(async (input) => {
      if (urlOf(input).includes("/payment-review-cases/") && urlOf(input).includes("/extend")) return json(200, { data: reviewCase });
      return json(200, { data: [reviewCase], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } });
    });
    renderAdmin(<PaymentReviewCaseList />);
    await userEvent.click(await screen.findByRole("button", { name: "Gia hạn giữ hàng" }));
    await userEvent.type(screen.getByPlaceholderText("Ghi chú gia hạn"), "Theo dõi thêm");
    await userEvent.type(screen.getByPlaceholderText("Thời điểm xem lại (ISO)"), "2026-10-24T12:00:00.000Z");
    await userEvent.click(screen.getByRole("button", { name: "Lưu gia hạn" }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([input]) => urlOf(input).includes("/extend"))).toBe(true));
    const request = fetchMock.mock.calls.find(([input]) => urlOf(input).includes("/extend"))?.[0] as Request;
    expect(await request.json()).toMatchObject({ version: 0, note: "Theo dõi thêm" });
  });
});
