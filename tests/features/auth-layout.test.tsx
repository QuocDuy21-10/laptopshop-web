import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuthLayout from "@/app/(auth)/layout";

describe("AuthLayout", () => {
  it("keeps only the logo and a way home, with no storefront navigation", () => {
    render(<AuthLayout>nội dung</AuthLayout>);
    expect(screen.getByRole("link", { name: /Về trang chủ/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("main")).toHaveTextContent("nội dung");
    expect(screen.queryByRole("search")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
