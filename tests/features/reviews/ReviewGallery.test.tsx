import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewGallery } from "@/features/reviews/ReviewGallery/ReviewGallery";
import type { ReviewImage } from "@/lib/api/types";
import { renderWithQuery } from "../../utils";

const image = (id: number, position: number): ReviewImage => ({
  id,
  url: `https://signed.test/${id}.webp`,
  urlExpiresAt: "2026-10-21T03:15:00.000Z",
  mimeType: "image/webp",
  width: 800,
  height: 600,
  position,
});

describe("ReviewGallery", () => {
  it.each([1, 2, 3])("renders the %s-image layout with dimensions and lazy loading", (count) => {
    renderWithQuery(<ReviewGallery images={Array.from({ length: count }, (_, index) => image(index + 1, index))} />);
    expect(screen.getByTestId("review-gallery")).toHaveAttribute("data-count", String(count));
    expect(screen.getAllByRole("img")).toHaveLength(count);
    expect(screen.getAllByRole("img")[0]).toHaveAttribute("loading", "lazy");
    expect(screen.getAllByRole("img")[0]).toHaveAttribute("width", "800");
  });

  it("opens a keyboard-accessible lightbox and returns focus to the trigger", async () => {
    renderWithQuery(<ReviewGallery images={[image(1, 0), image(2, 1)]} />);
    const trigger = screen.getByRole("button", { name: "Mở ảnh review 1" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(trigger).toHaveFocus();
  });

  it("renders nothing for an empty gallery", () => {
    const { container } = renderWithQuery(<ReviewGallery images={[]} />);
    expect(container.querySelector("[data-testid='review-gallery']")).toBeNull();
  });
});
