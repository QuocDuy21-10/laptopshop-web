import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeHero } from "@/features/home/HomeHero/HomeHero";
import type { PublicHomeBanner } from "@/lib/api/types";

const banner = (id: number, over: Partial<PublicHomeBanner> = {}): PublicHomeBanner => ({
  id, eyebrow: null, title: `Banner ${id}`, highlight: null, description: null, ctaText: null, linkUrl: null,
  secondaryCtaText: null, secondaryLinkUrl: null, badges: [], imageUrl: null, imageAlt: null, ...over,
});

describe("HomeHero", () => {
  it("shows the slider next to the side cards", () => {
    const { container } = render(
      <HomeHero
        hero={[banner(1)]}
        side={[banner(2, { linkUrl: "/products?target=SINHVIEN_VANPHONG", highlight: "15%" }), banner(3)]}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute("data-layout", "with-side");
    const list = screen.getByRole("list", { name: "Ưu đãi nổi bật" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByRole("link", { name: /Banner 2/ })).toHaveAttribute("href", "/products?target=SINHVIEN_VANPHONG");
    expect(within(list).getByText("15%")).toBeInTheDocument();
    expect(within(list).getByText("Banner 3").closest("a")).toBeNull();
  });

  it("lets the slider span the row when there are no side cards", () => {
    const { container } = render(<HomeHero hero={[banner(1)]} side={[]} />);
    expect(container.firstElementChild).toHaveAttribute("data-layout", "full");
    expect(screen.queryByRole("list", { name: "Ưu đãi nổi bật" })).not.toBeInTheDocument();
  });

  it("falls back to a static hero without figures when there is no banner", () => {
    render(<HomeHero hero={[]} side={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Chọn đúng laptop cho công việc và giải trí");
    expect(screen.getByRole("link", { name: "Xem tất cả laptop" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: "Tư vấn chọn laptop" })).toHaveAttribute("href", "/advisor");
    expect(document.body.textContent).not.toMatch(/\d/);
  });
});
