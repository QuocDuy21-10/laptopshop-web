import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithQuery } from "../../utils";
import type { WishlistItem } from "@/lib/api/types";
import { WishlistView } from "@/features/wishlist/WishlistView/WishlistView";

const state = vi.hoisted(() => ({ me: { id: 7 } as { id: number } | null, flash: true, pastEnd: false }));
const removeMutate = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError, success: vi.fn() } }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/wishlist",
}));
vi.mock("@/features/account/useMe", () => ({
  useMe: () => ({ data: state.me, isPending: false }),
}));
vi.mock("@/features/wishlist/hooks", () => ({
  useWishlist: (userId: number | undefined) => ({
    isPending: userId === undefined,
    isError: false,
    data: state.pastEnd
      ? { data: [], meta: { page: 9, pageSize: 10, total: 12, totalPages: 2, flashSaleAlertEnabled: state.flash } }
      : {
      data: [
        {
          id: 1,
          productId: 3,
          product: {
            id: 3,
            name: "Dell XPS",
            price: 1_000_000,
            salePrice: 950_000,
            productDiscountAmount: 50_000,
            image: null,
            quantity: 0,
            isActive: false,
          },
          alertMode: null,
          targetPrice: null,
          referencePrice: 1_000_000,
          includeFlashSale: true,
          alertVersion: 1,
          priceSnapshot: {
            productId: 3,
            listPrice: 1_000_000,
            stablePrice: 950_000,
            effectivePrice: 950_000,
            source: "AUTOMATIC",
            promotionId: 1,
            pricingVersion: 1,
            validUntil: "2026-11-01T00:00:00.000Z",
            purchasable: false,
          },
          lastAlertMode: "TARGET_PRICE",
          lastAlertedPrice: 900_000,
          lastAlertedAt: "2026-10-22T00:00:00.000Z",
          createdAt: "2026-10-22T00:00:00.000Z",
          updatedAt: "2026-10-22T00:00:00.000Z",
        },
      ] as unknown as WishlistItem[],
      meta: { page: 1, pageSize: 10, total: 1, totalPages: 1, flashSaleAlertEnabled: state.flash },
    },
  }),
  useRemoveWishlistItem: () => ({ mutate: removeMutate, isPending: false }),
  useConfigurePriceAlert: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("WishlistView", () => {
  beforeEach(() => {
    state.me = { id: 7 };
    state.flash = true;
    state.pastEnd = false;
    removeMutate.mockReset();
    toastError.mockReset();
  });

  it("links back to the last page instead of claiming an empty wishlist past the end", () => {
    state.pastEnd = true;
    renderWithQuery(<WishlistView page={9} />);
    expect(screen.queryByText("Danh sách yêu thích đang trống")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem trang 2" })).toHaveAttribute("href", "/wishlist?page=2");
  });

  it("shows an error toast when removal fails", async () => {
    const { ApiError } = await import("@/lib/api/errors");
    removeMutate.mockImplementation((_id: number, options: { onError: (e: unknown) => void }) =>
      options.onError(new ApiError(503, "SERVICE_UNAVAILABLE", "down")),
    );
    renderWithQuery(<WishlistView page={1} />);
    await userEvent.click(screen.getByRole("button", { name: /xoá/i }));
    expect(toastError).toHaveBeenCalledWith("Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
  });

  it("returns focus to the price-alert button after the dialog closes", async () => {
    renderWithQuery(<WishlistView page={1} />);
    const trigger = screen.getByRole("button", { name: "Theo dõi giá" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("asks a signed-out visitor to log in instead of loading forever", () => {
    state.me = null;
    renderWithQuery(<WishlistView page={1} />);
    expect(screen.getByRole("link", { name: /đăng nhập/i })).toHaveAttribute("href", "/login?next=%2Fwishlist");
  });

  it("hides Flash Sale tracking while the server has it disabled", () => {
    state.flash = false;
    renderWithQuery(<WishlistView page={1} />);
    expect(screen.queryByText(/Đang theo dõi Flash Sale/)).not.toBeInTheDocument();
  });

  it("shows live sale price, inactive stock state and target achievement", () => {
    renderWithQuery(<WishlistView page={1} />);
    expect(screen.getByText("950.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("Ngừng kinh doanh")).toBeInTheDocument();
    expect(screen.getByText("Đã đạt mục tiêu")).toBeInTheDocument();
    expect(screen.getByText(/Nguồn giá: Khuyến mãi tự động/)).toBeInTheDocument();
    expect(screen.getByText(/Đang theo dõi Flash Sale/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /xoá/i })).toBeEnabled();
  });
});
