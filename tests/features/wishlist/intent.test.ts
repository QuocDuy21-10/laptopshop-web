import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPendingWishlistIntent, readPendingWishlistIntent, savePendingWishlistIntent } from "@/features/wishlist/intent";

describe("pending wishlist intent", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("stores and reads a valid same-origin intent for ten minutes", () => {
    savePendingWishlistIntent({ action: "ADD_WISHLIST", productId: 7, returnTo: "/products/7" }, 1_000);
    expect(readPendingWishlistIntent(1_000)).toMatchObject({ version: 1, productId: 7, expiresAt: 601_000 });
  });

  it.each([
    "not-json",
    JSON.stringify({ version: 2, action: "ADD_WISHLIST", productId: 7, returnTo: "/products/7", expiresAt: 601_000 }),
    JSON.stringify({ version: 1, action: "ADD_WISHLIST", productId: 0, returnTo: "/products/7", expiresAt: 601_000 }),
    JSON.stringify({ version: 1, action: "ADD_WISHLIST", productId: 7, returnTo: "https://evil.test", expiresAt: 601_000 }),
    JSON.stringify({ version: 1, action: "ADD_WISHLIST", productId: 7, returnTo: "//evil.test", expiresAt: 601_000 }),
  ])("clears invalid stored data: %s", (value) => {
    window.sessionStorage.setItem("laptopshop.wishlist.intent", value);
    expect(readPendingWishlistIntent(1_000)).toBeNull();
    expect(window.sessionStorage.getItem("laptopshop.wishlist.intent")).toBeNull();
  });

  it("clears expired data and explicit clear is idempotent", () => {
    savePendingWishlistIntent({ action: "ADD_WISHLIST", productId: 7, returnTo: "/products/7" }, 1_000);
    expect(readPendingWishlistIntent(601_001)).toBeNull();
    clearPendingWishlistIntent();
    expect(readPendingWishlistIntent(601_001)).toBeNull();
  });

  it("rejects an intent whose expiry exceeds the ten-minute maximum", () => {
    window.sessionStorage.setItem("laptopshop.wishlist.intent", JSON.stringify({ version: 1, action: "ADD_WISHLIST", productId: 7, returnTo: "/products/7", expiresAt: 999_999_999 }));
    expect(readPendingWishlistIntent(1_000)).toBeNull();
  });

  it("does not throw when sessionStorage is blocked", () => {
    const getSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("blocked", "SecurityError"); });
    const setSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("blocked", "SecurityError"); });
    const removeSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("blocked", "SecurityError"); });

    let saved = true;
    expect(() => { saved = savePendingWishlistIntent({ action: "ADD_WISHLIST", productId: 7, returnTo: "/products/7" }); }).not.toThrow();
    expect(saved).toBe(false);
    expect(() => readPendingWishlistIntent()).not.toThrow();
    expect(readPendingWishlistIntent()).toBeNull();
    expect(() => clearPendingWishlistIntent()).not.toThrow();
    getSpy.mockRestore();
    setSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("rejects backslash-prefixed external return paths", () => {
    savePendingWishlistIntent({ action: "ADD_WISHLIST", productId: 7, returnTo: "/\\evil.test" });
    expect(readPendingWishlistIntent()).toBeNull();
  });
});
