import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { SiteShell } from "@/components/layout/SiteShell/SiteShell";

const state = vi.hoisted(() => ({ promo: true }));
vi.mock("@/components/layout/PromoBar/PromoBar", () => ({ PromoBar: () => state.promo ? <aside>Ưu đãi</aside> : null }));
vi.mock("@/components/layout/Header/Header", () => ({ Header: () => <header>Header</header> }));
vi.mock("@/components/layout/Footer/Footer", () => ({ Footer: () => <footer>Footer</footer> }));
vi.mock("@/features/compare/CompareBar/CompareBar", () => ({ CompareBar: () => null }));
vi.mock("@/features/cart/PendingCartIntent/PendingCartIntent", () => ({ PendingCartIntent: () => null }));
vi.mock("@/features/wishlist/PendingWishlistIntent/PendingWishlistIntent", () => ({ PendingWishlistIntent: () => null }));

describe("SiteShell", () => {
  it("places the optional promo before the sticky header, main and footer", () => {
    state.promo = true;
    render(<SiteShell>Nội dung</SiteShell>);
    const header = screen.getByRole("banner");
    expect(header.previousElementSibling).toHaveTextContent("Ưu đãi");
    expect(header.nextElementSibling).toBe(screen.getByRole("main"));
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(screen.getByRole("main").nextElementSibling).toBe(screen.getByRole("contentinfo"));
  });

  it("leaves no promo wrapper or spacer when there is no promotion", () => {
    state.promo = false;
    render(<SiteShell>Nội dung</SiteShell>);
    expect(screen.getByRole("banner").previousElementSibling).toBeNull();
  });
});
