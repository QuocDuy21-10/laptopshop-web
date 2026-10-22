import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PriceAlertDialog } from "@/features/wishlist/PriceAlertDialog/PriceAlertDialog";
import type { WishlistItem } from "@/lib/api/types";
import { renderWithQuery } from "../../utils";

const configure = vi.fn();
vi.mock("@/features/wishlist/hooks", () => ({ useConfigurePriceAlert: () => ({ mutateAsync: configure, isPending: false }) }));

const item = {
  id: 1,
  productId: 3,
  product: { id: 3, name: "Dell XPS", price: 1_000_000, salePrice: 950_000, productDiscountAmount: 50_000, image: null, quantity: 4, isActive: true },
  alertMode: null,
  targetPrice: null,
  referencePrice: null,
  lastAlertMode: null,
  lastAlertedPrice: null,
  lastAlertedAt: null,
  createdAt: "2026-10-22T00:00:00.000Z",
  updatedAt: "2026-10-22T00:00:00.000Z",
} as unknown as WishlistItem;

beforeEach(() => configure.mockReset());

describe("PriceAlertDialog", () => {
  it("offers the two modes and explains pricing boundaries", async () => {
    renderWithQuery(<PriceAlertDialog userId={7} item={item} open onOpenChange={vi.fn()} />);
    expect(screen.getByText(/không áp dụng Coupon hoặc Flash Sale/i)).toBeInTheDocument();
    expect(screen.getByText(/xác nhận lại giá cuối cùng/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /giảm thêm ít nhất 5%/i })).toBeChecked();
  });

  it("validates target below the live sale price before submitting", async () => {
    renderWithQuery(<PriceAlertDialog userId={7} item={item} open onOpenChange={vi.fn()} />);
    await userEvent.click(screen.getByRole("radio", { name: /mức giá mong muốn/i }));
    await userEvent.type(screen.getByLabelText(/Giá mục tiêu/i), "950000");
    await userEvent.click(screen.getByRole("button", { name: "Lưu cảnh báo" }));
    expect(await screen.findByText("Giá mục tiêu phải thấp hơn giá hiện tại")).toBeInTheDocument();
    expect(configure).not.toHaveBeenCalled();
  });
});
