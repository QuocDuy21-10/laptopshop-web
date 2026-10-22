import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PendingWishlistIntent } from "@/features/wishlist/PendingWishlistIntent/PendingWishlistIntent";
import { savePendingWishlistIntent } from "@/features/wishlist/intent";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "../../utils";

const mocks = vi.hoisted(() => ({ me: vi.fn(), mutateAsync: vi.fn() }));
vi.mock("@/features/account/useMe", () => ({ useMe: mocks.me }));
vi.mock("@/features/wishlist/hooks", () => ({ useAddWishlistItem: () => ({ mutateAsync: mocks.mutateAsync }) }));

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  mocks.me.mockReturnValue({ data: { id: 7 }, isPending: false });
  mocks.mutateAsync.mockResolvedValue({ data: {} });
});

describe("PendingWishlistIntent", () => {
  it("executes once under StrictMode and clears after success", async () => {
    savePendingWishlistIntent({ action: "ADD_WISHLIST", productId: 3, returnTo: "/products/3" });
    renderWithQuery(<StrictMode><PendingWishlistIntent /></StrictMode>);
    await vi.waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledWith(3));
    expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem("laptopshop.wishlist.intent")).toBeNull();
  });

  it("clears terminal product errors but keeps transient server errors", async () => {
    savePendingWishlistIntent({ action: "ADD_WISHLIST", productId: 3, returnTo: "/products/3" });
    mocks.mutateAsync.mockRejectedValueOnce(new ApiError(500, "UNKNOWN", "x"));
    renderWithQuery(<PendingWishlistIntent />);
    await vi.waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(window.sessionStorage.getItem("laptopshop.wishlist.intent")).not.toBeNull();
  });
});
