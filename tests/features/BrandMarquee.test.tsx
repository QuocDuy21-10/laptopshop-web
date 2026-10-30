import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMarquee, PARTNER_BRANDS } from "@/features/home/BrandMarquee/BrandMarquee";

describe("BrandMarquee", () => {
  it("shows no text label next to wordmark logos", () => {
    const { container } = render(<BrandMarquee />);
    const wordmarks = PARTNER_BRANDS.filter((b) => b.wordmark);
    expect(wordmarks.length).toBeGreaterThan(0);
    for (const brand of wordmarks) {
      expect(container.querySelectorAll(`[data-brand="${brand.key}"] span`)).toHaveLength(0);
      expect(
        screen.getAllByRole("link", { name: `Xem laptop ${brand.name}` }).length,
      ).toBeGreaterThan(0);
    }
  });

  it("keeps the text label for icon-only brands", () => {
    render(<BrandMarquee />);
    expect(screen.getAllByText("Apple").length).toBeGreaterThan(0);
  });
});
