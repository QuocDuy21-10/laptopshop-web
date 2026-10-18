import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination } from "@/components/ui/Pagination/Pagination";

describe("Pagination", () => {
  it("links pages and marks the current one", () => {
    render(<Pagination page={2} totalPages={3} hrefFor={(p) => `/products?page=${p}`} />);
    expect(screen.getByRole("link", { name: "Trang 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Trang trước" })).toHaveAttribute(
      "href",
      "/products?page=1",
    );
    expect(screen.getByRole("link", { name: "Trang sau" })).toHaveAttribute(
      "href",
      "/products?page=3",
    );
  });

  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} hrefFor={String} />);
    expect(container).toBeEmptyDOMElement();
  });
});
