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
  includeFlashSale: false,
  alertVersion: 1,
  priceSnapshot: { productId: 3, listPrice: 1_000_000, stablePrice: 950_000, effectivePrice: 950_000, source: "AUTOMATIC", promotionId: 1, pricingVersion: 1, validUntil: "2026-11-01T00:00:00.000Z", purchasable: true },
} as unknown as WishlistItem;

beforeEach(() => configure.mockReset());

describe("PriceAlertDialog", () => {
  it("offers the two modes and explains pricing boundaries", async () => {
    renderWithQuery(<PriceAlertDialog userId={7} item={item} open onOpenChange={vi.fn()} />);
    expect(screen.getByText(/Flash Sale phụ thuộc stock và quota/i)).toBeInTheDocument();
    expect(screen.getByText(/xác nhận lại giá cuối cùng/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /giảm thêm ít nhất 5%/i })).toBeChecked();
  });

  it("submits explicit Flash Sale opt-in", async () => {
    renderWithQuery(<PriceAlertDialog userId={7} item={item} open onOpenChange={vi.fn()} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /theo dõi Flash Sale/i }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu cảnh báo" }));
    expect(configure).toHaveBeenCalledWith({
      productId: 3,
      input: { mode: "PERCENT_DROP", includeFlashSale: true },
    });
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
