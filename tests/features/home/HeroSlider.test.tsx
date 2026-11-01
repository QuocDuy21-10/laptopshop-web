import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroSlider } from "@/features/home/HeroSlider/HeroSlider";
import type { PublicHomeBanner } from "@/lib/api/types";

const banner = (id: number, over: Partial<PublicHomeBanner> = {}): PublicHomeBanner => ({
  id,
  eyebrow: null,
  title: `Slide ${id}`,
  highlight: null,
  description: null,
  ctaText: null,
  linkUrl: null,
  secondaryCtaText: null,
  secondaryLinkUrl: null,
  badges: [],
  imageUrl: null,
  imageAlt: null,
  ...over,
});

afterEach(() => vi.useRealTimers());

// jsdom may lack PointerEvent; without it fireEvent.pointerDown drops clientX
if (!("PointerEvent" in window)) Object.defineProperty(window, "PointerEvent", { value: MouseEvent });

describe("HeroSlider", () => {
  it("renders the banner content with internal and external links", () => {
    render(
      <HeroSlider
        slides={[
          banner(1, {
            eyebrow: "Mới",
            highlight: "RTX 50",
            description: "Mô tả",
            ctaText: "Xem ngay",
            linkUrl: "/products?target=GAMING",
            secondaryCtaText: "Chi tiết",
            secondaryLinkUrl: "https://example.com/x",
            badges: ["165Hz"],
            imageUrl: "/images/banner/a.png",
            imageAlt: "Laptop gaming",
          }),
        ]}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Slide 1 RTX 50");
    expect(screen.getByRole("link", { name: "Xem ngay" })).toHaveAttribute("href", "/products?target=GAMING");
    const external = screen.getByRole("link", { name: "Chi tiết" });
    expect(external).toHaveAttribute("href", "https://example.com/x");
    expect(external).toHaveAttribute("rel", "noopener");
    expect(screen.getByAltText("Laptop gaming")).toBeInTheDocument();
    expect(screen.getByText("165Hz")).toBeInTheDocument();
  });

  it("never changes slide on its own", () => {
    vi.useFakeTimers();
    render(<HeroSlider slides={[banner(1), banner(2)]} />);
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Slide 1");
  });

  it("moves with the buttons, the dots and the arrow keys", async () => {
    render(<HeroSlider slides={[banner(1), banner(2), banner(3)]} />);
    await userEvent.click(screen.getByRole("button", { name: "Slide tiếp theo" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Slide 2");
    await userEvent.click(screen.getByRole("button", { name: "Chuyển tới slide 3" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Slide 3");
    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Slide 1");
    await userEvent.click(screen.getByRole("button", { name: "Slide trước" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Slide 3");
  });

  it("swipes on touch", () => {
    render(<HeroSlider slides={[banner(1), banner(2)]} />);
    const region = screen.getByRole("region");
    fireEvent.pointerDown(region, { clientX: 300 });
    fireEvent.pointerUp(region, { clientX: 200 });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Slide 2");
  });

  it("hides the controls for a single slide", () => {
    render(<HeroSlider slides={[banner(1)]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
