import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Filters } from "@/features/products/Filters/Filters";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const options = {
  factoryOptions: [
    { name: "Asus", value: "ASUS" },
    { name: "Dell", value: "DELL" },
  ],
  targetOptions: [{ name: "Gaming", value: "GAMING" }],
};

beforeEach(() => router.push.mockClear());

describe("Filters", () => {
  it("adds a factory and resets to page 1", async () => {
    render(<Filters options={options} filters={{ factory: [], target: [], price: [], page: 3 }} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Asus" }));
    expect(router.push).toHaveBeenCalledWith("/products?factory=ASUS", { scroll: false });
  });

  it("removes a selected price range and keeps the search", async () => {
    render(<Filters options={options} filters={{ factory: [], target: [], price: ["under-10m"], q: "tuf", page: 1 }} />);
    const box = screen.getByRole("checkbox", { name: "Dưới 10 triệu" });
    expect(box).toBeChecked();
    await userEvent.click(box);
    expect(router.push).toHaveBeenCalledWith("/products?q=tuf", { scroll: false });
  });
});
