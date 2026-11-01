import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PublicPromotion } from "@/lib/api/types";
import { PromoBar } from "@/components/layout/PromoBar/PromoBar";
import { PromoBarClient } from "@/components/layout/PromoBar/PromoBarClient";

const loader = vi.hoisted(() => vi.fn());
vi.mock("@/features/promotions/server", () => ({ getPromoBarPromotion: loader }));
const promotion: PublicPromotion = {
  id: 1, name: "Ưu đãi", description: null, code: "SAVE10", scope: "ORDER", discountKind: "PERCENT",
  discountValue: 10, minOrderValue: 0, maxDiscount: null,
  startsAt: "2026-10-31T00:00:00Z", endsAt: "2026-11-02T00:00:00Z",
};
const bar = () => screen.queryByRole("region", { name: "Thông báo khuyến mãi" });
const close = () => userEvent.click(screen.getByRole("button", { name: "Đóng thông báo khuyến mãi" }));

beforeEach(() => { localStorage.clear(); loader.mockReset(); });
afterEach(() => vi.restoreAllMocks());

describe("PromoBar", () => {
  it("renders a percent coupon and the real destination without invented minimums", async () => {
    loader.mockResolvedValue(promotion);
    render(await PromoBar());
    expect(bar()).toHaveTextContent("Nhập mã SAVE10 giảm 10%");
    expect(screen.getByText("SAVE10").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "Xem ưu đãi" })).toHaveAttribute("href", "/promotions");
    expect(bar()).not.toHaveTextContent("cho đơn từ");
  });

  it("formats fixed discounts and a positive minimum in VND", () => {
    render(<PromoBarClient promotion={{ ...promotion, discountKind: "FIXED", discountValue: 200000, minOrderValue: 1000000 }} />);
    expect(bar()).toHaveTextContent("giảm 200.000 ₫ cho đơn từ 1.000.000 ₫");
  });

  it("renders nothing when the server has no promotion", async () => {
    loader.mockResolvedValue(null);
    const { container } = render(await PromoBar());
    expect(container).toBeEmptyDOMElement();
  });

  it("removes the bar and remembers exactly the dismissed ID", async () => {
    const { container } = render(<PromoBarClient promotion={promotion} />);
    await close();
    expect(localStorage.getItem("promo-bar-dismissed")).toBe("1");
    expect(container).toBeEmptyDOMElement();
  });

  it("hides a saved ID but shows a new promotion on the same mounted instance", () => {
    localStorage.setItem("promo-bar-dismissed", "1");
    const { rerender } = render(<PromoBarClient promotion={promotion} />);
    expect(bar()).toBeNull();
    rerender(<PromoBarClient promotion={{ ...promotion, id: 2, code: "NEW10" }} />);
    expect(bar()).toHaveTextContent("NEW10");
  });

  it("shows a new ID after dismissing a previous ID without remounting", async () => {
    const { rerender } = render(<PromoBarClient promotion={promotion} />);
    await close();
    rerender(<PromoBarClient promotion={{ ...promotion, id: 2 }} />);
    expect(bar()).toBeInTheDocument();
  });

  it("remains usable when storage reads and writes are blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<PromoBarClient promotion={promotion} />);
    expect(bar()).toBeInTheDocument();
    await close();
    expect(bar()).toBeNull();
  });

  it("keeps the server markup visible even when this browser previously dismissed it", () => {
    localStorage.setItem("promo-bar-dismissed", "1");
    expect(renderToString(<PromoBarClient promotion={promotion} />)).toContain("SAVE10");
  });
});
