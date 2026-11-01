import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewHighlights } from "@/features/home/ReviewHighlights/ReviewHighlights";

const item = (id: number, over: Record<string, unknown> = {}) => ({
  id,
  rating: 5,
  title: null,
  content: "Máy chạy êm, pin trâu, màn hình đẹp rất đáng tiền.",
  createdAt: "2026-10-20T08:00:00.000Z",
  helpfulCount: 1,
  author: { name: "Lan", anonymous: false },
  product: { id: 30 + id, name: `Laptop ${id}`, image: null },
  ...over,
});

describe("ReviewHighlights", () => {
  it("shows the real average, total and review cards", () => {
    render(
      <ReviewHighlights
        data={{
          summary: { averageRating: 4.6, totalReviews: 128 },
          items: [item(1), item(2, { rating: 4, author: { name: "****", anonymous: true }, title: "Ổn" })],
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Khách hàng nói gì về LaptopShop?" })).toBeInTheDocument();
    expect(screen.getByText("4.6")).toBeInTheDocument();
    expect(screen.getByText("128 đánh giá")).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Đánh giá nổi bật" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText("****")).toBeInTheDocument();
    expect(within(list).getByLabelText("4 trên 5 sao")).toBeInTheDocument();
    expect(within(list).getByRole("link", { name: "Laptop 1" })).toHaveAttribute("href", "/products/31");
  });

  it("renders nothing without reviews", () => {
    const { container } = render(
      <ReviewHighlights data={{ summary: { averageRating: null, totalReviews: 0 }, items: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
