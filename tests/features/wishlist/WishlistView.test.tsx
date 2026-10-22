import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WishlistView } from "@/features/wishlist/WishlistView/WishlistView";
import type { WishlistItem } from "@/lib/api/types";
import { renderWithQuery } from "../../utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/wishlist" }));
vi.mock("@/features/account/useMe", () => ({ useMe: () => ({ data: { id: 7 }, isPending: false }) }));
vi.mock("@/features/wishlist/hooks", () => ({
  useWishlist: () => ({ isPending: false, isError: false, data: { data: [
    { id: 1, productId: 3, product: { id: 3, name: "Dell XPS", price: 1_000_000, salePrice: 950_000, productDiscountAmount: 50_000, image: null, quantity: 0, isActive: false }, alertMode: null, targetPrice: null, referencePrice: 1_000_000, lastAlertMode: "TARGET_PRICE", lastAlertedPrice: 900_000, lastAlertedAt: "2026-10-22T00:00:00.000Z", createdAt: "2026-10-22T00:00:00.000Z", updatedAt: "2026-10-22T00:00:00.000Z" },
  ] as unknown as WishlistItem[], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } } }),
  useRemoveWishlistItem: () => ({ mutate: vi.fn(), isPending: false }),
  useConfigurePriceAlert: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("WishlistView", () => {
  it("shows live sale price, inactive stock state and target achievement", () => {
    renderWithQuery(<WishlistView page={1} />);
    expect(screen.getByText("950.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("Ngừng kinh doanh")).toBeInTheDocument();
    expect(screen.getByText("Đã đạt mục tiêu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /xoá/i })).toBeEnabled();
  });
});
