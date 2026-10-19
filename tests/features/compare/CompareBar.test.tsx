import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompareBar } from "@/features/compare/CompareBar/CompareBar";
import { toggleCompare } from "@/features/compare/store";

const nav = vi.hoisted(() => ({ pathname: "/products" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const add = (id: number) => toggleCompare({ id, name: `Laptop ${id}`, image: null });

beforeEach(() => {
  localStorage.clear();
  nav.pathname = "/products";
});

describe("CompareBar", () => {
  it("renders nothing when the list is empty", () => {
    render(<CompareBar />);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("asks for a second product when only one is picked", () => {
    add(1);
    render(<CompareBar />);
    expect(screen.getByRole("button", { name: "So sánh (1)" })).toBeDisabled();
    expect(screen.getByText("Chọn thêm ít nhất 1 sản phẩm")).toBeInTheDocument();
  });

  it("links to the compare page with the picked ids in order", () => {
    add(2);
    add(1);
    render(<CompareBar />);
    expect(screen.getByRole("link", { name: "So sánh (2)" })).toHaveAttribute(
      "href",
      "/compare?ids=2,1",
    );
  });

  it("removes one product and clears all", async () => {
    add(1);
    add(2);
    render(<CompareBar />);
    await userEvent.click(screen.getByRole("button", { name: "Bỏ Laptop 1 khỏi so sánh" }));
    expect(screen.queryByText("Laptop 1")).not.toBeInTheDocument();
    expect(screen.getByText("Laptop 2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xoá tất cả" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("follows changes made elsewhere", () => {
    render(<CompareBar />);
    act(() => {
      add(1);
    });
    expect(screen.getByRole("complementary", { name: "So sánh sản phẩm" })).toBeInTheDocument();
  });

  it("hides itself on the compare page", () => {
    add(1);
    add(2);
    nav.pathname = "/compare";
    render(<CompareBar />);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
});
