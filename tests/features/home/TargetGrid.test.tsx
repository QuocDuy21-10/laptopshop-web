import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TargetGrid } from "@/features/home/TargetGrid/TargetGrid";

describe("TargetGrid", () => {
  it("links each need to the filtered listing with the best seller photo when there is one", () => {
    const { container } = render(
      <TargetGrid
        targets={[
          { value: "GAMING", name: "Gaming" },
          { value: "MONG_NHE", name: "Mỏng nhẹ" },
        ]}
        images={{ GAMING: "/images/product/9.png", MONG_NHE: null }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Mua laptop theo nhu cầu" })).toBeInTheDocument();
    const gaming = screen.getByRole("link", { name: /Gaming/ });
    expect(gaming).toHaveAttribute("href", "/products?target=GAMING");
    expect(within(gaming).getByText("Máy cấu hình mạnh cho chơi game")).toBeInTheDocument();
    expect(gaming.querySelector("img")).toHaveAttribute("src", "/images/product/9.png");
    const light = screen.getByRole("link", { name: /Mỏng nhẹ/ });
    expect(light.querySelector("img")).toBeNull();
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
  });
});
