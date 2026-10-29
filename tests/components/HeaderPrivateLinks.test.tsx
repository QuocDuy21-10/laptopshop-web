import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccountMenu } from "@/components/layout/AccountMenu/AccountMenu";
import { WishlistLink } from "@/components/layout/WishlistLink/WishlistLink";
import { NotificationBell } from "@/features/notifications/NotificationBell/NotificationBell";
import { renderWithQuery } from "../utils";

vi.mock("@/features/account/useMe", () => ({ useMe: () => ({ data: { id: 7, role: "USER", fullName: "A", username: "a@test.local" }, isPending: false }) }));
vi.mock("@/features/wishlist/hooks", () => ({ useWishlistSummary: () => ({ data: { itemCount: 3 }, isPending: false }) }));
vi.mock("@/features/notifications/hooks", () => ({ useUnreadNotificationCount: () => ({ data: { unreadCount: 2 }, isPending: false }) }));
vi.mock("@/features/auth/hooks", () => ({ useLogout: () => ({ mutate: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/" }));

describe("private header links", () => {
  it("surfaces wishlist and notification counts with accessible labels", () => {
    renderWithQuery(<><WishlistLink userId={7} /><NotificationBell userId={7} /></>);
    expect(screen.getByRole("link", { name: /Yêu thích.*3/i })).toHaveAttribute("href", "/wishlist");
    expect(screen.getByRole("link", { name: /Thông báo.*2/i })).toHaveAttribute("href", "/account/notifications");
  });

  it("adds wishlist and notification destinations to the account menu", async () => {
    renderWithQuery(<AccountMenu />);
    await userEvent.click(screen.getByRole("button", { name: /A/ }));
    expect(screen.getByRole("menuitem", { name: "Sản phẩm yêu thích" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Bảo hành & Hậu mãi" })).toHaveAttribute("href", "/account/after-sales");
    expect(screen.getByRole("menuitem", { name: "Thông báo" })).toBeInTheDocument();
  });
});
