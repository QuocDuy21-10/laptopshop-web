import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdvisorBanner } from "@/features/home/AdvisorBanner/AdvisorBanner";

describe("AdvisorBanner", () => {
  it("links to the advisor without claims", () => {
    render(<AdvisorBanner />);
    expect(screen.getByRole("heading", { level: 2, name: "Chưa biết chọn laptop nào?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nhận gợi ý/ })).toHaveAttribute("href", "/advisor");
    expect(document.body.textContent).not.toMatch(/\d/);
  });
});
