import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewSection } from "@/features/reviews/ReviewSection/ReviewSection";
import { json, lastRequest, mockFetch, renderWithQuery, urlOf } from "../../utils";
import type { PublicReview, ReviewSummary } from "@/lib/api/types";

const emptySummary: ReviewSummary = {
  productId: 12,
  averageRating: null,
  totalReviews: 0,
  distribution: {},
};

const review: PublicReview = {
  id: 1,
  productId: 12,
  rating: 5,
  title: "Rất ổn",
  content: "Nội dung <script>alert('x')</script>",
  author: { name: "****", anonymous: true },
  verifiedPurchase: true,
  images: [],
  helpfulCount: 0,
  createdAt: "2026-10-21T03:00:00.000Z",
  updatedAt: "2026-10-21T03:00:00.000Z",
  officialReply: { content: "Phản hồi chính thức", createdAt: "2026-10-21T03:00:00.000Z", updatedAt: "2026-10-21T03:00:00.000Z" },
};

const initialPage = { data: [review], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } };

describe("ReviewSection", () => {
  beforeEach(() => mockFetch());

  it("shows an honest empty state instead of zero-star social proof", () => {
    renderWithQuery(<ReviewSection productId={12} initialSummary={emptySummary} initialPage={{ ...initialPage, data: [], meta: { ...initialPage.meta, total: 0, totalPages: 0 } }} />);
    expect(screen.getByText("Chưa có đánh giá nào")).toBeInTheDocument();
    expect(screen.queryByText(/0 sao/)).not.toBeInTheDocument();
  });

  it("shows anonymous/public names and renders review content as text", () => {
    renderWithQuery(<ReviewSection productId={12} initialSummary={{ ...emptySummary, averageRating: 4.5, totalReviews: 2, distribution: { "4": 1, "5": 1 } }} initialPage={initialPage} />);
    expect(screen.getByText("****")).toBeInTheDocument();
    expect(screen.getByText("Nội dung <script>alert('x')</script>")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByText("Đã mua hàng")).toBeInTheDocument();
  });

  it("sends allow-listed rating and sort filters", async () => {
    const fetchMock = mockFetch();
    const withReviews = { ...emptySummary, averageRating: 4.5, totalReviews: 2, distribution: { "4": 1, "5": 1 } };
    fetchMock.mockImplementation(async (input) =>
      urlOf(input).includes("/summary") ? json(200, { data: withReviews }) : json(200, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }),
    );
    renderWithQuery(<ReviewSection productId={12} initialSummary={{ ...emptySummary, averageRating: 4.5, totalReviews: 2, distribution: { "4": 1, "5": 1 } }} initialPage={{ ...initialPage, data: [] }} />);
    await userEvent.selectOptions(screen.getByLabelText("Lọc theo số sao"), "5");
    await userEvent.selectOptions(screen.getByLabelText("Sắp xếp"), "highest");
    await waitFor(() => expect(urlOf(lastRequest(fetchMock))).toContain("rating=5"));
    expect(urlOf(lastRequest(fetchMock))).toContain("sort=highest");
  });

  it("hides the chart and the filters until the first review exists", () => {
    renderWithQuery(<ReviewSection productId={12} initialSummary={emptySummary} initialPage={{ ...initialPage, data: [] }} />);
    expect(screen.queryByLabelText("Lọc theo số sao")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Phân bố số sao")).not.toBeInTheDocument();
    expect(screen.getByText("Chưa có đánh giá nào")).toBeInTheDocument();
  });

  it("shows retry for a public list error", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(500, { error: { code: "UNKNOWN", message: "failed" } }));
    renderWithQuery(<ReviewSection productId={12} initialSummary={emptySummary} initialPage={{ ...initialPage, data: [] }} />);
    expect(await screen.findByRole("button", { name: "Thử lại" })).toBeInTheDocument();
  });

  it("explains why a signed-in customer cannot review yet", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockImplementation(async (input) => {
      const url = urlOf(input);
      if (url.includes("/users/me")) return json(200, { data: { id: 7, fullName: "Buyer" } });
      if (url.includes("eligibility")) return json(200, { data: { eligible: false, reason: "ORDER_NOT_COMPLETED", existingReview: null, willRequireModeration: false } });
      if (url.includes("summary")) return json(200, { data: emptySummary });
      return json(200, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
    });
    renderWithQuery(<ReviewSection productId={12} initialSummary={emptySummary} initialPage={{ ...initialPage, data: [] }} />);
    expect(await screen.findByText("Bạn có thể đánh giá sau khi đơn hàng hoàn tất.")).toBeInTheDocument();
  });
});
