import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { PendingCartIntent } from "@/features/cart/PendingCartIntent/PendingCartIntent";
import { readPendingCartIntent, savePendingCartIntent } from "@/features/cart/intent";
import { renderWithQuery } from "../../utils";

const mocks = vi.hoisted(() => ({ me: vi.fn(), mutateAsync: vi.fn(), push: vi.fn() }));
vi.mock("@/features/account/useMe", () => ({ useMe: mocks.me }));
vi.mock("@/features/cart/hooks", () => ({ useAddToCart: () => ({ mutateAsync: mocks.mutateAsync }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  mocks.me.mockReturnValue({ data: { id: 7 } });
  mocks.mutateAsync.mockResolvedValue({ data: {} });
});

describe("PendingCartIntent", () => {
  it("adds once under StrictMode, toasts and clears the intent", async () => {
    savePendingCartIntent({ productId: 3, quantity: 2, goToCart: false });
    renderWithQuery(<StrictMode><PendingCartIntent /></StrictMode>);
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mocks.mutateAsync).toHaveBeenCalledWith({ productId: 3, quantity: 2 });
    expect(readPendingCartIntent()).toBeNull();
  });

  it("goes to the cart for a 'Mua ngay' intent", async () => {
    savePendingCartIntent({ productId: 3, quantity: 1, goToCart: true });
    renderWithQuery(<PendingCartIntent />);
    await vi.waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/cart"));
  });

  it("does nothing for guests", () => {
    mocks.me.mockReturnValue({ data: undefined });
    savePendingCartIntent({ productId: 3, quantity: 1, goToCart: false });
    renderWithQuery(<PendingCartIntent />);
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(readPendingCartIntent()).not.toBeNull();
  });

  it("ignores expired intents", () => {
    savePendingCartIntent({ productId: 3, quantity: 1, goToCart: false }, Date.now() - 11 * 60 * 1000);
    expect(readPendingCartIntent()).toBeNull();
  });
});
